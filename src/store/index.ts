import { configureStore, Middleware } from "@reduxjs/toolkit";
import languagesReducer from "./slices/languagesSlice";
import chatReducer from "./slices/chatSlice";
import type { ChatState } from "./slices/chatSlice";
import uiReducer from "./slices/uiSlice";
import onboardingReducer from "./slices/onboardingSlice";

const CHAT_STORAGE_KEY = "lang-tutor-chat";

const emptyChatState: ChatState = {
  messagesByLanguage: {},
  sessionIdByLanguage: {},
  formatByLanguage: {},
  lastGreetedDateByLanguage: {},
  streaming: false,
  pendingStart: null,
  pendingStartFresh: true,
};

const loadChatState = (): ChatState => {
  if (typeof window === "undefined") return emptyChatState;
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return emptyChatState;
    const parsed = JSON.parse(raw);
    return {
      messagesByLanguage: parsed.messagesByLanguage ?? {},
      sessionIdByLanguage: parsed.sessionIdByLanguage ?? {},
      formatByLanguage: parsed.formatByLanguage ?? {},
      lastGreetedDateByLanguage: parsed.lastGreetedDateByLanguage ?? {},
      streaming: false,
      pendingStart: null,
      pendingStartFresh: true,
    };
  } catch {
    return emptyChatState;
  }
}

const persistChatMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const type = (action as { type: string }).type;
  if (type.startsWith("chat/") && type !== "chat/appendToLastAssistant") {
    try {
      const { streaming, ...rest } = store.getState().chat as ChatState;
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(rest));
    } catch {}
  }
  return result;
};

export const store = configureStore({
  reducer: {
    languages: languagesReducer,
    chat: chatReducer,
    ui: uiReducer,
    onboarding: onboardingReducer,
  },
  preloadedState: {
    chat: loadChatState(),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistChatMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
