"use client";

import React from "react";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import { Badge, LoadingDots } from "@/components/ui";
import { MessageRole } from "@/types";
import type { ChatMessage } from "@/types";

const Wrapper = styled.div<{ $role: MessageRole }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $role }) => ($role === MessageRole.User ? "flex-end" : "flex-start")};
  gap: 4px;
  max-width: 78%;
  align-self: ${({ $role }) => ($role === MessageRole.User ? "flex-end" : "flex-start")};
`;

const InfoCard = styled.div`
  align-self: stretch;
  background: ${theme.colors.bgTertiary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 14px 16px;
  font-size: 14px;
  line-height: 1.8;
  color: ${theme.colors.textSecondary};
  white-space: pre-wrap;
  word-break: break-word;
  strong { font-weight: 600; color: ${theme.colors.textPrimary}; }
`;

const Bubble = styled.div<{ $role: MessageRole }>`
  padding: 10px 14px;
  border-radius: ${({ $role }) =>
    $role === MessageRole.User
      ? `${theme.radii.lg} ${theme.radii.sm} ${theme.radii.lg} ${theme.radii.lg}`
      : `${theme.radii.sm} ${theme.radii.lg} ${theme.radii.lg} ${theme.radii.lg}`};
  font-size: 15px;
  line-height: 1.6;
  background: ${({ $role }) =>
    $role === MessageRole.User ? theme.colors.userBubble : theme.colors.aiBubble};
  color: ${({ $role }) =>
    $role === MessageRole.User ? theme.colors.userBubbleText : theme.colors.aiBubbleText};
  white-space: pre-wrap;
  word-break: break-word;

  strong { font-weight: 600; }
  em { font-style: italic; }
`;

const FeedbackRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const scoreBadgeVariant = (score: number) => {
  if (score >= 7) return "success";
  if (score >= 4) return "warning";
  return "danger";
};

const scoreIcon = (score: number) => {
  if (score >= 7) return "✓";
  if (score >= 4) return "◐";
  return "✗";
};

const formatText = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");

interface Props {
  message: ChatMessage;
  isStreaming?: boolean;
}

export const MessageBubble = ({ message, isStreaming }: Props) => {
  if (message.isLocal) {
    return (
      <InfoCard
        dangerouslySetInnerHTML={{ __html: formatText(message.content) }}
      />
    );
  }

  // Don't render empty assistant bubbles after streaming is done
  if (message.role === MessageRole.Assistant && !message.content && !isStreaming) {
    return null;
  }

  return (
  <Wrapper $role={message.role}>
    {isStreaming && message.role === MessageRole.Assistant && !message.content ? (
      <Bubble $role={MessageRole.Assistant}>
        <LoadingDots>
          <span />
        </LoadingDots>
      </Bubble>
    ) : (
      <Bubble
        $role={message.role}
        dangerouslySetInnerHTML={{
          __html: formatText(message.content),
        }}
      />
    )}

    {message.feedback?.score != null && (
      <FeedbackRow>
        <Badge $variant={scoreBadgeVariant(message.feedback.score)}>
          {scoreIcon(message.feedback.score)} {message.feedback.score}/10
        </Badge>
        {message.feedback.newWord && (
          <Badge $variant="brand">
            📖 {message.feedback.newWord.word}
          </Badge>
        )}
      </FeedbackRow>
    )}
  </Wrapper>
  );
};
