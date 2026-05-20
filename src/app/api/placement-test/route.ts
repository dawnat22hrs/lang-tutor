import OpenAI from "openai";
import { NextRequest } from "next/server";
import { buildPlacementPrompt } from "@/lib/prompts";
import { placementTestSchema } from "@/lib/schemas";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Lang Tutor",
  },
});

export const POST = async (req: NextRequest): Promise<Response> => {
  const parsed = placementTestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.issues }), { status: 400 });
  }

  const { messages, language } = parsed.data;

  let stream: AsyncIterable<OpenAI.Chat.ChatCompletionChunk>;
  try {
    stream = await client.chat.completions.create({
      model: "openai/gpt-oss-120b:free",
      max_tokens: 1024,
      messages: [
        { role: "system", content: buildPlacementPrompt(language) },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
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

      let sent = 0;
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (!text) continue;
        fullText += text;

        const resultStart = fullText.indexOf("<result");
        let safeLength = resultStart === -1 ? fullText.length : resultStart;

        if (resultStart === -1) {
          const tag = "<result";
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

      const match = fullText.match(/<result>\s*([\s\S]*?)\s*<\/result>/);
      if (match) {
        try {
          send({ result: JSON.parse(match[1]) });
        } catch (e) {
          console.error("Failed to parse placement result:", e);
        }
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
