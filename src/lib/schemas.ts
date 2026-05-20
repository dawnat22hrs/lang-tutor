import { z } from "zod";
import { CEFRLevel, Interest, SessionFormat, MessageRole } from "@/types";

const messageSchema = z.object({
  role: z.nativeEnum(MessageRole),
  content: z.string(),
});

export const createLanguageSchema = z.object({
  id: z.string().min(1),
  language: z.string().min(1).max(60),
  level: z.nativeEnum(CEFRLevel),
  interests: z.array(z.nativeEnum(Interest)).min(1),
});

export const sendMessageSchema = z.object({
  messages: z.array(messageSchema).min(1),
  languageId: z.string().min(1),
  format: z.nativeEnum(SessionFormat),
  sessionId: z.number().int().positive().optional(),
});

export const placementTestSchema = z.object({
  messages: z.array(messageSchema),
  language: z.string().min(1).max(60),
});

export type CreateLanguageInput = z.infer<typeof createLanguageSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type PlacementTestInput = z.infer<typeof placementTestSchema>;
