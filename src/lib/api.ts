import axios from "axios";
import { COMMON } from "@/lib/locale";
import type {
  AIFeedback,
  PlacementResult,
  ProgressSummary,
  VocabularyItem,
  SendMessagePayload,
  PlacementTestPayload,
} from "@/types";

const client = axios.create({
  headers: { "Content-Type": "application/json" },
});

export const getProgress = async (languageId: string): Promise<ProgressSummary> => {
  const { data } = await client.get<ProgressSummary>(`/api/progress/${languageId}`, {
    params: { _t: Date.now() },
  });
  return data;
};

export const getVocabulary = async (
  languageId: string
): Promise<{ learned: VocabularyItem[]; due: VocabularyItem[] }> => {
  const { data } = await client.get(`/api/vocabulary/${languageId}`);
  return data;
};

const parseSSEChunk = (chunk: string, handler: (data: Record<string, unknown>) => void): void => {
  for (const line of chunk.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      handler(JSON.parse(line.slice(6)));
    } catch {}
  }
}

export interface ChatStreamCallbacks {
  onSessionId: (sessionId: number) => void;
  onText: (text: string) => void;
  onFeedback: (feedback: AIFeedback) => void;
  onError: (text: string) => void;
}

export const streamChat = async (
  payload: SendMessagePayload,
  callbacks: ChatStreamCallbacks
): Promise<void> => {
  let processedLength = 0;

  try {
    await client.post("/api/chat", payload, {
      responseType: "text",
      onDownloadProgress: (evt) => {
        const fullText = (evt.event?.target as XMLHttpRequest)?.responseText ?? "";
        const newChunk = fullText.slice(processedLength);
        processedLength = fullText.length;

        parseSSEChunk(newChunk, (data) => {
          if (data.sessionId) callbacks.onSessionId(data.sessionId as number);
          if (data.text) callbacks.onText(data.text as string);
          if (data.feedback) {
            callbacks.onFeedback(data.feedback as AIFeedback);
          }
        });
      },
    });
  } catch (e: any) {
    callbacks.onError(COMMON.serverError);
  }

}

export interface PlacementStreamCallbacks {
  onText: (text: string) => void;
  onResult: (result: PlacementResult) => void;
  onDone: () => void;
}

export const streamPlacementTest = async (
  payload: PlacementTestPayload,
  callbacks: PlacementStreamCallbacks
): Promise<void> => {
  let processedLength = 0;

  await client.post("/api/placement-test", payload, {
    responseType: "text",
    onDownloadProgress: (evt) => {
      const fullText = (evt.event?.target as XMLHttpRequest)?.responseText ?? "";
      const newChunk = fullText.slice(processedLength);
      processedLength = fullText.length;

      parseSSEChunk(newChunk, (data) => {
        if (data.text) callbacks.onText(data.text as string);
        if (data.result) callbacks.onResult(data.result as PlacementResult);
        if (data.done) callbacks.onDone();
      });
    },
  });
}
