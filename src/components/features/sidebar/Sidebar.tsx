"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setActiveLanguage, removeLanguage } from "@/store/slices/languagesSlice";
import { setFormat, clearMessages, initLanguage, addMessage, triggerContinue } from "@/store/slices/chatSlice";
import { openAddLanguage, setSidebarOpen } from "@/store/slices/uiSlice";
import { theme } from "@/styles/theme";
import { Badge, Button, Divider, SectionLabel, StatCard, StatNumber, StatLabel } from "@/components/ui";
import { SessionFormat, MessageRole } from "@/types";
import type { ProgressSummary } from "@/types";
import { getProgress, getVocabulary } from "@/lib/api";
import { SESSION_FORMAT_LABELS, SIDEBAR, COMMON } from "@/lib/locale";

const Aside = styled.aside<{ $open: boolean }>`
  width: ${theme.sidebar.width};
  background: ${theme.colors.bgPrimary};
  border-right: 1px solid ${theme.colors.border};
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-shrink: 0;
  overflow-y: auto;
  transition: transform 0.25s ease;

  @media (max-width: ${theme.breakpoints.mobile}) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 50;
    transform: translateX(${({ $open }) => ($open ? "0" : "-100%")});
    box-shadow: ${({ $open }) =>
      $open ? theme.shadows.md : "none"};
  }
`;

const Section = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;


const LanguageItem = styled.div<{ $active: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: ${theme.radii.md};
  background: ${({ $active }) =>
    $active ? theme.colors.brandLight : "transparent"};
  color: ${({ $active }) =>
    $active ? theme.colors.brandText : theme.colors.textPrimary};
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 500 : 400)};
  cursor: pointer;
  transition: background 0.15s;
  gap: 6px;

  &:hover {
    background: ${({ $active }) =>
      $active ? theme.colors.brandLight : theme.colors.bgTertiary};
  }

  &:hover .delete-btn {
    opacity: 1;
  }
`;

const LanguageLabel = styled.span`
  flex: 1;
  text-align: left;
`;

const DeleteBtn = styled.button`
  flex-shrink: 0;
  opacity: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.colors.textMuted};
  font-size: 15px;
  line-height: 1;
  padding: 0 2px;
  transition: color 0.15s, opacity 0.15s;

  &:hover {
    color: ${theme.colors.danger ?? "#e53e3e"};
  }
`;

const ConfirmRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.bgTertiary};
  font-size: 13px;
  color: ${theme.colors.textSecondary};
`;

const FormatButton = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: 7px 10px;
  border-radius: ${theme.radii.md};
  border: none;
  background: ${({ $active }) =>
    $active ? theme.colors.brandLight : "transparent"};
  color: ${({ $active }) =>
    $active ? theme.colors.brandText : theme.colors.textSecondary};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 500 : 400)};
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${theme.colors.bgTertiary};
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const FORMATS = Object.values(SessionFormat);

export const Sidebar = () => {
  const dispatch = useAppDispatch();
  const { profiles, activeLanguageId } = useAppSelector((s) => s.languages);
  const { formatByLanguage, streaming } = useAppSelector((s) => s.chat);
  const { sidebarOpen, progressRefreshKey } = useAppSelector((s) => s.ui);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activeFormat = activeLanguageId
    ? formatByLanguage[activeLanguageId] ?? SessionFormat.Review
    : SessionFormat.Review;

  useEffect(() => {
    if (!activeLanguageId) return;
    getProgress(activeLanguageId).then(setProgress);
  }, [activeLanguageId, progressRefreshKey]);

  const handleLanguageSelect = (id: string) => {
    dispatch(setActiveLanguage(id));
    dispatch(initLanguage({ languageId: id }));
    dispatch(setSidebarOpen(false));
  };

  const injectLocalMessage = (content: string) => {
    if (!activeLanguageId) return;
    dispatch(addMessage({
      languageId: activeLanguageId,
      message: {
        id: crypto.randomUUID(),
        role: MessageRole.Assistant,
        content,
        isLocal: true,
        createdAt: new Date().toISOString(),
      },
    }));
  };

  const handleFormatChange = (format: SessionFormat) => {
    if (!activeLanguageId) return;
    if (format === SessionFormat.Review && format !== activeFormat && progress?.dueToday === 0) {
      dispatch(setFormat({ languageId: activeLanguageId, format, autoStart: false }));
      injectLocalMessage("На сегодня слов для повторения нет. Возвращайтесь завтра или выберите другой формат занятия.");
      return;
    }
    if (format === activeFormat) {
      dispatch(triggerContinue(activeLanguageId));
    } else {
      dispatch(setFormat({ languageId: activeLanguageId, format, autoStart: true }));
    }
  };

  const handleDeleteConfirm = (id: string) => {
    dispatch(removeLanguage(id));
    dispatch(clearMessages(id));
    setConfirmDeleteId(null);
  };

  const handleShowLearnedWords = async () => {
    if (!activeLanguageId || !progress || progress.totalWords === 0) return;
    const { learned } = await getVocabulary(activeLanguageId);
    if (!learned.length) return;
    injectLocalMessage(
      `📚 **Изученные слова (${learned.length}):**\n` +
      learned.map((w) => `• ${w.word} — ${w.translation}`).join("\n")
    );
  };

  const handleShowDueWords = async () => {
    if (!activeLanguageId || !progress || progress.dueToday === 0) return;
    const { due } = await getVocabulary(activeLanguageId);
    if (!due.length) return;
    injectLocalMessage(
      `🔔 **Слова для повторения (${due.length}):**\n` +
      due.map((w) => `• ${w.word} — ${w.translation}`).join("\n")
    );
  };

  return (
    <Aside $open={sidebarOpen} style={streaming ? { pointerEvents: "none", opacity: 0.5 } : undefined}>
      <Section>
        <SectionLabel>{SIDEBAR.languages}</SectionLabel>
        {profiles.map((p) =>
          confirmDeleteId === p.id ? (
            <ConfirmRow key={p.id}>
              <span style={{ flex: 1 }}>{SIDEBAR.deleteConfirm(p.language)}</span>
              <Button
                $variant="danger"
                $size="sm"
                onClick={() => handleDeleteConfirm(p.id)}
              >
                {COMMON.yes}
              </Button>
              <Button
                $variant="ghost"
                $size="sm"
                onClick={() => setConfirmDeleteId(null)}
              >
                {COMMON.no}
              </Button>
            </ConfirmRow>
          ) : (
            <LanguageItem
              key={p.id}
              $active={p.id === activeLanguageId}
              onClick={() => handleLanguageSelect(p.id)}
            >
              <LanguageLabel>{p.language}</LanguageLabel>
              <Badge $variant="brand" style={{ fontSize: 11 }}>
                {p.level}
              </Badge>
              <DeleteBtn
                className="delete-btn"
                title={SIDEBAR.deleteTitle}
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDeleteId(p.id);
                }}
              >
                ×
              </DeleteBtn>
            </LanguageItem>
          )
        )}
        <Button
          $variant="ghost"
          $size="sm"
          $fullWidth
          style={{ marginTop: 8 }}
          onClick={() => dispatch(openAddLanguage())}
        >
          {SIDEBAR.addLanguage}
        </Button>
      </Section>

      <Divider />

      <Section>
        <SectionLabel>{SIDEBAR.format}</SectionLabel>
        {FORMATS.map((f) => (
          <FormatButton
            key={f}
            $active={activeFormat === f}
            onClick={() => handleFormatChange(f)}
          >
            {SESSION_FORMAT_LABELS[f]}
          </FormatButton>
        ))}
      </Section>

      <Divider />

      {progress && (
        <Section>
          <SectionLabel>{SIDEBAR.progress}</SectionLabel>
          <StatGrid>
            <StatCard
              onClick={handleShowLearnedWords}
              style={{ cursor: progress.totalWords > 0 ? "pointer" : "default" }}
            >
              <StatNumber>{progress.totalWords}</StatNumber>
              <StatLabel>{SIDEBAR.statsWords}</StatLabel>
            </StatCard>
          </StatGrid>

          {progress.weakItems.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <SectionLabel>{SIDEBAR.weakItems}</SectionLabel>
              {progress.weakItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    fontSize: 13,
                  }}
                >
                  {item.word}
                  <Badge $variant="danger">{Math.round(item.score)}/10</Badge>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}
    </Aside>
  );
};
