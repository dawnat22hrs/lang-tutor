import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SessionFormat, MessageRole } from "@/types";
import type { ChatMessage, AIFeedback } from "@/types";

export interface ChatState {
  messagesByLanguage: Record<string, ChatMessage[]>;
  sessionIdByLanguage: Record<string, number>;
  formatByLanguage: Record<string, SessionFormat>;
  lastGreetedDateByLanguage: Record<string, string>;
  streaming: boolean;
  pendingStart: string | null;
  pendingStartFresh: boolean;
}

const initialState: ChatState = {
  messagesByLanguage: {},
  sessionIdByLanguage: {},
  formatByLanguage: {},
  lastGreetedDateByLanguage: {},
  streaming: false,
  pendingStart: null,
  pendingStartFresh: true,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    initLanguage(
      state,
      action: PayloadAction<{ languageId: string; format?: SessionFormat }>
    ) {
      const { languageId, format = SessionFormat.Review } = action.payload;
      if (!state.messagesByLanguage[languageId]) {
        state.messagesByLanguage[languageId] = [];
      }
      if (!state.formatByLanguage[languageId]) {
        state.formatByLanguage[languageId] = format;
      }
    },

    setFormat(
      state,
      action: PayloadAction<{ languageId: string; format: SessionFormat; autoStart?: boolean }>
    ) {
      const { languageId, format, autoStart } = action.payload;
      state.formatByLanguage[languageId] = format;
      delete state.sessionIdByLanguage[languageId];
      if (autoStart) {
        state.pendingStart = languageId;
        state.pendingStartFresh = true;
      }
    },

    triggerContinue(state, action: PayloadAction<string>) {
      state.pendingStart = action.payload;
      state.pendingStartFresh = false;
    },

    clearPendingStart(state) {
      state.pendingStart = null;
      state.pendingStartFresh = true;
    },

    addMessage(
      state,
      action: PayloadAction<{ languageId: string; message: ChatMessage }>
    ) {
      const { languageId, message } = action.payload;
      if (!state.messagesByLanguage[languageId]) {
        state.messagesByLanguage[languageId] = [];
      }
      state.messagesByLanguage[languageId].push(message);
    },

    appendToLastAssistant(
      state,
      action: PayloadAction<{ languageId: string; text: string }>
    ) {
      const msgs = state.messagesByLanguage[action.payload.languageId];
      if (!msgs) return;
      const last = msgs[msgs.length - 1];
      if (last?.role === MessageRole.Assistant) {
        last.content += action.payload.text;
      }
    },

    attachFeedback(
      state,
      action: PayloadAction<{ languageId: string; feedback: AIFeedback }>
    ) {
      const msgs = state.messagesByLanguage[action.payload.languageId];
      if (!msgs) return;
      const last = msgs[msgs.length - 1];
      if (last?.role === MessageRole.Assistant) {
        last.feedback = action.payload.feedback;
      }
    },

    setSessionId(
      state,
      action: PayloadAction<{ languageId: string; sessionId: number }>
    ) {
      state.sessionIdByLanguage[action.payload.languageId] =
        action.payload.sessionId;
    },

    setStreaming(state, action: PayloadAction<boolean>) {
      state.streaming = action.payload;
    },

    setLastGreetedDate(
      state,
      action: PayloadAction<{ languageId: string; date: string }>
    ) {
      state.lastGreetedDateByLanguage[action.payload.languageId] = action.payload.date;
    },

    clearLanguageMessages(state, action: PayloadAction<string>) {
      state.messagesByLanguage[action.payload] = [];
    },

    clearMessages(state, action: PayloadAction<string>) {
      delete state.messagesByLanguage[action.payload];
      delete state.sessionIdByLanguage[action.payload];
      delete state.formatByLanguage[action.payload];
      delete state.lastGreetedDateByLanguage[action.payload];
    },
  },
});

export const {
  initLanguage,
  setFormat,
  triggerContinue,
  clearPendingStart,
  addMessage,
  appendToLastAssistant,
  attachFeedback,
  setSessionId,
  setStreaming,
  setLastGreetedDate,
  clearLanguageMessages,
  clearMessages,
} = chatSlice.actions;
export default chatSlice.reducer;
