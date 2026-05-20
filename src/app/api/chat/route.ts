import OpenAI from "openai";
import { NextRequest } from "next/server";
import {
  getProfile,
  getDueItems,
  reviewItem,
  upsertVocabItem,
  getItemByWord,
  getItemById,
  getLatestUnreviewedItem,
  startSession,
  endOpenSessions,
  incrementSession,
} from "@/lib/db";
import { buildTutorPrompt } from "@/lib/prompts";
import { sendMessageSchema } from "@/lib/schemas";
import { AI_COMMANDS } from "@/lib/locale";
import { spellCheckScore } from "@/lib/utils";
import { SessionFormat } from "@/types";
import type { AIFeedback } from "@/types";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Lang Tutor",
  },
});

export const POST = async (req: NextRequest): Promise<Response> => {
  const parsed = sendMessageSchema.safeParse(await req.json());
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.issues }), { status: 400 });
  }

  const { messages, languageId, format, sessionId: bodySessionId } = parsed.data;

  const profile = getProfile(languageId);
  if (!profile) {
    return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404 });
  }

  const dueItems = getDueItems(languageId, 10);
  const systemPrompt = buildTutorPrompt(profile, format, dueItems);

  let sessionId = bodySessionId;
  if (!sessionId) {
    endOpenSessions(languageId);
    const session = startSession(languageId, format);
    sessionId = session.id;
  }

  let stream: AsyncIterable<OpenAI.Chat.ChatCompletionChunk>;
  try {
    stream = await client.chat.completions.create({
      model: "openai/gpt-oss-120b:free",
      max_tokens: 1024,
      messages: [{ role: "system", content: systemPrompt }, ...messages.map((m) => ({ role: m.role, content: m.content }))],
      stream: true,
    });
  } catch (e: any) {
    console.error("OpenRouter API error:", e);
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), { status: 500 });
  }

  const encoder = new TextEncoder();
  let fullText = "";

  const readable = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      send({ sessionId });

      let sent = 0;
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (!text) continue;
        fullText += text;

        const feedbackStart = fullText.indexOf("<feedback");
        let safeLength = feedbackStart === -1 ? fullText.length : feedbackStart;

        if (feedbackStart === -1) {
          const tag = "<feedback";
          for (let len = Math.min(tag.length - 1, fullText.length); len > 0; len--) {
            if (fullText.endsWith(tag.slice(0, len))) {
              safeLength = fullText.length - len;
              break;
            }
          }
        }
        if (safeLength > sent) {
          send({ text: fullText.slice(sent, safeLength) });
          sent = safeLength;
        }
      }

      const feedbackRegex = /<feedback>\s*([\s\S]*?)\s*<\/feedback>/g;
      let fbMatch: RegExpExecArray | null;
      let scoredFeedback: AIFeedback | null = null;
      let newWordFeedback: AIFeedback | null = null;

      const lastUserContent = messages[messages.length - 1]?.content ?? "";
      const isShortAnswer = lastUserContent.trim().split(/\s+/).length <= 3;

      while ((fbMatch = feedbackRegex.exec(fullText)) !== null) {
        try {
          const feedback: AIFeedback = JSON.parse(fbMatch[1]);

          if (feedback.correct === false && feedback.score != null && feedback.score >= 7) {
            feedback.score = 6;
          }

          if (feedback.wordId != null && feedback.score != null && feedback.score >= 7 && isShortAnswer) {
            const item = getItemById(feedback.wordId);
            if (item) {
              const dist = Math.min(
                spellCheckScore(lastUserContent, item.word),
                spellCheckScore(lastUserContent, item.translation)
              );
              if (dist > 1) {
                feedback.score = 6;
                feedback.correct = false;
              }
            }
          }

          if (feedback.wordId != null && feedback.score != null) {
            reviewItem(feedback.wordId, feedback.score);
            incrementSession(sessionId, feedback.score);
            scoredFeedback = feedback;
          }

          if (feedback.newWord) {
            const existingWord = getItemByWord(languageId, feedback.newWord.word);
            upsertVocabItem(
              languageId,
              feedback.newWord.word,
              feedback.newWord.translation,
              feedback.newWord.context
            );

            if (existingWord && feedback.score != null && feedback.score > 0 && feedback.wordId == null) {
              reviewItem(existingWord.id, feedback.score);
              incrementSession(sessionId, feedback.score);
              scoredFeedback = { ...feedback, wordId: existingWord.id };
            }

            newWordFeedback = feedback;
          }

          if (
            format === SessionFormat.Vocabulary &&
            feedback.score != null && feedback.score > 0 &&
            feedback.wordId == null && !feedback.newWord
          ) {
            const item = getLatestUnreviewedItem(languageId, newWordFeedback?.newWord?.word);
            if (item) {
              reviewItem(item.id, feedback.score);
              incrementSession(sessionId, feedback.score);
              scoredFeedback = { ...feedback, wordId: item.id };
            }
          }
        } catch (e) {
          console.error("Failed to parse feedback:", e);
        }
      }

      const isAICommand = (Object.values(AI_COMMANDS) as string[]).includes(lastUserContent);
      if (format === SessionFormat.Vocabulary && !scoredFeedback && !isAICommand) {
        const excludeWord = newWordFeedback?.newWord?.word;
        const score = newWordFeedback?.score ?? 7;
        const item = getLatestUnreviewedItem(languageId, excludeWord);
        if (item) {
          reviewItem(item.id, score);
          incrementSession(sessionId, score);
          scoredFeedback = { score, wordId: item.id, correct: newWordFeedback?.correct ?? true };
        }
      }

      if (scoredFeedback || newWordFeedback) {
        const combined: AIFeedback = {
          ...(scoredFeedback ?? {}),
          ...(newWordFeedback ? { newWord: newWordFeedback.newWord } : {}),
        };
        send({ feedback: combined });
      }

      send({ done: true });
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
