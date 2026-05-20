"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  addMessage,
  appendToLastAssistant,
  attachFeedback,
  setSessionId,
  setStreaming,
  initLanguage,
  setFormat,
  clearPendingStart,
} from "@/store/slices/chatSlice";
import { invalidateProgress } from "@/store/slices/uiSlice";
import { theme } from "@/styles/theme";
import { MessageBubble } from "./MessageBubble";
import { SessionGreeting } from "./SessionGreeting";
import { Button, Textarea } from "@/components/ui";
import { SessionFormat, MessageRole } from "@/types";
import type { ChatMessage, ProgressSummary } from "@/types";
import { getProgress, streamChat } from "@/lib/api";
import { CHAT, AI_COMMANDS } from "@/lib/locale";

const ChatWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: ${theme.colors.bgSecondary};
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InputBar = styled.div`
  padding: 12px 16px;
  border-top: 1px solid ${theme.colors.border};
  background: ${theme.colors.bgPrimary};
  display: flex;
  gap: 10px;
  align-items: flex-end;
`;

const SendButton = styled(Button)`
  padding: 10px 16px;
  flex-shrink: 0;
  align-self: flex-end;
`;

export const Chat = () => {
  const dispatch = useAppDispatch();
  const { profiles, activeLanguageId } = useAppSelector((s) => s.languages);
  const { messagesByLanguage, sessionIdByLanguage, formatByLanguage, streaming, pendingStart, pendingStartFresh } =
    useAppSelector((s) => s.chat);
  const { progressRefreshKey } = useAppSelector((s) => s.ui);

  const [input, setInput] = useState("");
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isStreamingRef = useRef(false);

  const activeProfile = profiles.find((p) => p.id === activeLanguageId);
  const messages: ChatMessage[] = useMemo(
    () => (activeLanguageId ? messagesByLanguage[activeLanguageId] ?? [] : []),
    [activeLanguageId, messagesByLanguage]
  );
  const format = activeLanguageId
    ? formatByLanguage[activeLanguageId] ?? SessionFormat.Review
    : SessionFormat.Review;
  const sessionId = activeLanguageId
    ? sessionIdByLanguage[activeLanguageId]
    : undefined;

  const showGreeting = messages.length === 0;

  const sendMessage = useCallback(
    async (userText: string, hidden = false, overrideFormat?: SessionFormat, freshStart = false) => {
      if (!activeLanguageId || isStreamingRef.current) return;
      isStreamingRef.current = true;

      const currentFormat = overrideFormat ?? format;
      const currentMessages: ChatMessage[] = freshStart ? [] : (messagesByLanguage[activeLanguageId] ?? []);

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: MessageRole.User,
        content: userText,
        createdAt: new Date().toISOString(),
      };

      if (!hidden) {
        dispatch(addMessage({ languageId: activeLanguageId, message: userMsg }));
        setInput("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: MessageRole.Assistant,
        content: "",
        createdAt: new Date().toISOString(),
      };
      dispatch(addMessage({ languageId: activeLanguageId, message: assistantMsg }));
      dispatch(setStreaming(true));

      const history = [
        ...currentMessages
          .filter((m) => !m.isLocal && (m.content || m.role === MessageRole.Assistant))
          .map((m) => ({ role: m.role, content: m.content || "..." })),
        { role: MessageRole.User, content: userText },
      ];

      try {
        await streamChat(
          { messages: history, languageId: activeLanguageId, format: currentFormat, sessionId },
          {
            onSessionId: (sid) => {
              if (!sessionId)
                dispatch(setSessionId({ languageId: activeLanguageId, sessionId: sid }));
            },
            onText: (text) =>
              dispatch(appendToLastAssistant({ languageId: activeLanguageId, text })),
            onFeedback: (feedback) => {
              dispatch(attachFeedback({ languageId: activeLanguageId, feedback }));
              dispatch(invalidateProgress());
            },
            onError: (text) =>
              dispatch(appendToLastAssistant({ languageId: activeLanguageId, text })),
          }
        );
      } finally {
        isStreamingRef.current = false;
        dispatch(setStreaming(false));
        dispatch(invalidateProgress());
        textareaRef.current?.focus();
      }
    },
    [activeLanguageId, format, messagesByLanguage, sessionId, dispatch]
  );

  const latestRef = useRef({ formatByLanguage, messagesByLanguage, pendingStartFresh, sendMessage });
  latestRef.current = { formatByLanguage, messagesByLanguage, pendingStartFresh, sendMessage };

  useEffect(() => {
    if (!activeLanguageId) return;
    getProgress(activeLanguageId).then(setProgress);
  }, [activeLanguageId, progressRefreshKey]);

  useEffect(() => {
    if (!activeLanguageId) return;
    dispatch(initLanguage({ languageId: activeLanguageId }));
  }, [activeLanguageId, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeLanguageId || pendingStart !== activeLanguageId) return;
    dispatch(clearPendingStart());

    const { formatByLanguage: fbL, messagesByLanguage: mbL, pendingStartFresh: psf, sendMessage: sm } = latestRef.current;
    const currentFormat = fbL[activeLanguageId] ?? SessionFormat.Review;
    const existing: ChatMessage[] = mbL[activeLanguageId] ?? [];
    const hasMessages = existing.length > 0;

    let command: string;
    let freshStart: boolean;
    if (!hasMessages) {
      command = AI_COMMANDS.startLesson;
      freshStart = false;
    } else if (psf) {
      command = AI_COMMANDS.switchFormat;
      freshStart = true;
    } else {
      command = AI_COMMANDS.continueLesson;
      freshStart = false;
    }
    sm(command, true, currentFormat, freshStart);
  }, [pendingStart, activeLanguageId, dispatch]);


  const handleSelectFormat = (selectedFormat: SessionFormat) => {
    if (!activeLanguageId) return;
    dispatch(setFormat({ languageId: activeLanguageId, format: selectedFormat }));
    sendMessage(AI_COMMANDS.startLesson, true, selectedFormat);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !streaming) sendMessage(input.trim());
    }
  };

  if (!activeProfile) {
    return (
      <ChatWrapper
        style={{
          alignItems: "center",
          justifyContent: "center",
          color: theme.colors.textMuted,
          fontSize: 15,
        }}
      >
        {CHAT.noLanguage}
      </ChatWrapper>
    );
  }

  return (
    <ChatWrapper>
      <MessageList>
        {showGreeting ? (
          <SessionGreeting
            profile={activeProfile}
            progress={progress}
            onSelectFormat={handleSelectFormat}
          />
        ) : (
          messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={
                streaming && i === messages.length - 1 && msg.role === MessageRole.Assistant
              }
            />
          ))
        )}
        <div ref={bottomRef} />
      </MessageList>

      {!showGreeting && (
        <InputBar>
          <Textarea
            ref={textareaRef}
            rows={1}
            placeholder={CHAT.inputPlaceholder}
            value={input}
            disabled={streaming}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            style={{ lineHeight: 1.5, minHeight: 40 }}
          />
          <SendButton
            disabled={!input.trim() || streaming}
            onClick={() => sendMessage(input.trim())}
          >
            {streaming ? "..." : "→"}
          </SendButton>
        </InputBar>
      )}
    </ChatWrapper>
  );
};
