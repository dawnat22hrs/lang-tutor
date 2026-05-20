"use client";

import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  setStep,
  setLanguage,
  setLevel,
  toggleInterest,
  addPlacementMessage,
  appendToLastPlacement,
  setPlacementResult,
  setPlacementStreaming,
  retryPlacement,
  reset,
  OnboardingStep,
} from "@/store/slices/onboardingSlice";
import { createLanguage, fetchLanguages } from "@/store/slices/languagesSlice";
import { closeAddLanguage } from "@/store/slices/uiSlice";
import { theme } from "@/styles/theme";
import { Button, TextInput, Badge, LoadingDots, Heading, Subtitle, Caption } from "@/components/ui";
import { CEFRLevel, Interest, MessageRole } from "@/types";
import type { ChatMessage } from "@/types";
import { streamPlacementTest } from "@/lib/api";
import { CEFR_DESCRIPTIONS, INTEREST_LABELS, ONBOARDING, AI_COMMANDS, COMMON } from "@/lib/locale";
import { isValidLanguage } from "@/lib/languages";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
`;

const Modal = styled.div`
  background: ${theme.colors.bgPrimary};
  border-radius: ${theme.radii.xl};
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ProgressBar = styled.div`
  display: flex;
  gap: 6px;
`;

const ProgressStep = styled.div<{ $active: boolean }>`
  height: 3px;
  flex: 1;
  border-radius: 99px;
  background: ${({ $active }) =>
    $active ? theme.colors.brand : theme.colors.bgTertiary};
  transition: background 0.3s;
`;


const OptionGrid = styled.div<{ $cols?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $cols = 2 }) => $cols}, 1fr);
  gap: 8px;
`;

const OptionButton = styled.button<{ $selected: boolean }>`
  padding: 10px 14px;
  border-radius: ${theme.radii.md};
  border: 1.5px solid
    ${({ $selected }) =>
      $selected ? theme.colors.brand : theme.colors.border};
  background: ${({ $selected }) =>
    $selected ? theme.colors.brandLight : theme.colors.bgPrimary};
  color: ${({ $selected }) =>
    $selected ? theme.colors.brandText : theme.colors.textPrimary};
  font-size: 14px;
  font-weight: ${({ $selected }) => ($selected ? 500 : 400)};
  text-align: left;
  transition: all 0.15s;
  cursor: pointer;

  &:hover {
    border-color: ${theme.colors.brand};
    background: ${theme.colors.brandLight};
  }
`;

const PlacementChat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 320px;
  overflow-y: auto;
  padding: 4px 0;
`;

const PlacementBubble = styled.div<{ $role: MessageRole }>`
  align-self: ${({ $role }) => ($role === MessageRole.User ? "flex-end" : "flex-start")};
  max-width: 85%;
  padding: 9px 13px;
  border-radius: ${theme.radii.lg};
  font-size: 14px;
  line-height: 1.55;
  background: ${({ $role }) =>
    $role === MessageRole.User ? theme.colors.userBubble : theme.colors.aiBubble};
  color: ${({ $role }) =>
    $role === MessageRole.User ? theme.colors.userBubbleText : theme.colors.aiBubbleText};
  border-radius: ${({ $role }) =>
    $role === MessageRole.User
      ? `${theme.radii.lg} ${theme.radii.sm} ${theme.radii.lg} ${theme.radii.lg}`
      : `${theme.radii.sm} ${theme.radii.lg} ${theme.radii.lg} ${theme.radii.lg}`};
`;

const ResultCard = styled.div`
  background: ${theme.colors.brandLight};
  border: 1px solid ${theme.colors.brand};
  border-radius: ${theme.radii.lg};
  padding: 20px;
  text-align: center;
`;

const LevelBadge = styled.div`
  font-size: 42px;
  font-weight: 700;
  color: ${theme.colors.brand};
  line-height: 1;
  margin-bottom: 4px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 4px;
`;

const ErrorText = styled.p`
  margin: -16px 0 0;
  font-size: 13px;
  color: #e53935;
`;

const TOTAL_ONBOARDING_STEPS = 3;

const CEFR_LEVELS = Object.values(CEFRLevel);
const INTERESTS = Object.values(Interest);

interface Props {
  isFirstRun?: boolean;
}

export const OnboardingWizard = ({ isFirstRun = false }: Props) => {
  const dispatch = useAppDispatch();
  const {
    step,
    language,
    level,
    interests,
    placementMessages,
    placementResult,
    placementStreaming,
  } = useAppSelector((s) => s.onboarding);

  const [placementInput, setPlacementInput] = useState("");
  const [langError, setLangError] = useState(false);
  const placementBottomRef = useRef<HTMLDivElement>(null);

  const stepIndex =
    step === OnboardingStep.Language
      ? 0
      : step === OnboardingStep.LevelChoice || step === OnboardingStep.Placement || step === OnboardingStep.PlacementResult
      ? 1
      : 2;

  useEffect(() => {
    placementBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [placementMessages]);

  useEffect(() => {
    if (step === OnboardingStep.Placement && placementMessages.length === 0) {
      sendPlacementRef.current(AI_COMMANDS.startPlacement);
    }
  }, [step, placementMessages.length]);

  const handleLanguageNext = () => {
    if (!isValidLanguage(language)) {
      setLangError(true);
      return;
    }
    setLangError(false);
    dispatch(setStep(OnboardingStep.LevelChoice));
  };

  const sendPlacementMessage = async (userText: string) => {
    if (placementStreaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: MessageRole.User,
      content: userText,
      createdAt: new Date().toISOString(),
    };

    if (userText !== AI_COMMANDS.startPlacement) {
      dispatch(addPlacementMessage(userMsg));
    }

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: MessageRole.Assistant,
      content: "",
      createdAt: new Date().toISOString(),
    };
    dispatch(addPlacementMessage(assistantMsg));
    dispatch(setPlacementStreaming(true));
    setPlacementInput("");

    const history = [
      ...placementMessages
        .filter((m) => m.content)
        .map((m) => ({ role: m.role, content: m.content })),
      { role: MessageRole.User, content: userText },
    ];

    await streamPlacementTest(
      { messages: history, language },
      {
        onText: (text) => dispatch(appendToLastPlacement(text)),
        onResult: (result) => dispatch(setPlacementResult(result)),
        onDone: () => dispatch(setPlacementStreaming(false)),
      }
    );
  };

  const sendPlacementRef = useRef(sendPlacementMessage);
  sendPlacementRef.current = sendPlacementMessage;

  const handleComplete = async () => {
    if (!language || !level || interests.length === 0) return;

    const id = language.toLowerCase().replace(/\s+/g, "-");
    await dispatch(createLanguage({ id, language, level, interests }));
    await dispatch(fetchLanguages());

    dispatch(reset());
    if (!isFirstRun) dispatch(closeAddLanguage());
  };

  const close = () => {
    if (!isFirstRun) {
      dispatch(reset());
      dispatch(closeAddLanguage());
    }
  };

  return (
    <Overlay onClick={isFirstRun ? undefined : close}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ProgressBar>
          {Array.from({ length: TOTAL_ONBOARDING_STEPS }).map((_, i) => (
            <ProgressStep key={i} $active={i <= stepIndex} />
          ))}
        </ProgressBar>

        {step === OnboardingStep.Language && (
          <>
            <div>
              <Heading>{ONBOARDING.languageTitle}</Heading>
              <Subtitle>{ONBOARDING.languageSubtitle}</Subtitle>
            </div>
            <TextInput
              autoFocus
              placeholder={ONBOARDING.languagePlaceholder}
              value={language}
              onChange={(e) => {
                dispatch(setLanguage(e.target.value));
                if (langError) setLangError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && language.trim() && handleLanguageNext()}
            />
            {langError && <ErrorText>{ONBOARDING.languageError}</ErrorText>}
            <Footer>
              {!isFirstRun && (
                <Button $variant="ghost" $size="sm" onClick={close}>
                  {COMMON.cancel}
                </Button>
              )}
              <Button
                style={{ marginLeft: "auto" }}
                disabled={!language.trim()}
                onClick={handleLanguageNext}
              >
                {COMMON.next}
              </Button>
            </Footer>
          </>
        )}

        {step === OnboardingStep.LevelChoice && (
          <>
            <div>
              <Heading>{ONBOARDING.levelTitle}</Heading>
              <Subtitle>{ONBOARDING.levelSubtitle}</Subtitle>
            </div>
            <OptionGrid $cols={3}>
              {CEFR_LEVELS.map((l) => (
                <OptionButton
                  key={l}
                  $selected={level === l}
                  onClick={() => dispatch(setLevel(l))}
                >
                  <strong>{l}</strong>
                  <br />
                  <Caption style={{ color: theme.colors.textSecondary }}>
                    {CEFR_DESCRIPTIONS[l]}
                  </Caption>
                </OptionButton>
              ))}
            </OptionGrid>

            <Button
              $variant="ghost"
              $fullWidth
              onClick={() => dispatch(setStep(OnboardingStep.Placement))}
            >
              {ONBOARDING.levelUnknown}
            </Button>

            <Footer>
              <Button
                $variant="ghost"
                $size="sm"
                onClick={() => dispatch(setStep(OnboardingStep.Language))}
              >
                {COMMON.back}
              </Button>
              <Button
                disabled={!level}
                onClick={() => dispatch(setStep(OnboardingStep.Interests))}
              >
                {COMMON.next}
              </Button>
            </Footer>
          </>
        )}

        {step === OnboardingStep.Placement && (
          <>
            <div>
              <Heading>{ONBOARDING.placementTitle}</Heading>
              <Subtitle>{ONBOARDING.placementSubtitle(language)}</Subtitle>
            </div>

            <PlacementChat>
              {placementMessages
                .filter((m) => m.content)
                .map((m) => (
                  <PlacementBubble key={m.id} $role={m.role}>
                    {m.content}
                    {placementStreaming &&
                      m === placementMessages[placementMessages.length - 1] &&
                      m.role === MessageRole.Assistant && (
                        <LoadingDots style={{ marginLeft: 6 }}>
                          <span />
                        </LoadingDots>
                      )}
                  </PlacementBubble>
                ))}
              <div ref={placementBottomRef} />
            </PlacementChat>

            <div style={{ display: "flex", gap: 8 }}>
              <TextInput
                placeholder={ONBOARDING.placementPlaceholder}
                value={placementInput}
                disabled={placementStreaming}
                onChange={(e) => setPlacementInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && placementInput.trim() && !placementStreaming)
                    sendPlacementMessage(placementInput.trim());
                }}
              />
              <Button
                disabled={!placementInput.trim() || placementStreaming}
                onClick={() => sendPlacementMessage(placementInput.trim())}
              >
                →
              </Button>
            </div>
          </>
        )}

        {step === OnboardingStep.PlacementResult && placementResult && (
          <>
            <div>
              <Heading>{ONBOARDING.resultTitle}</Heading>
            </div>

            <ResultCard>
              <LevelBadge>{placementResult.level}</LevelBadge>
              <Subtitle style={{ fontSize: 16, fontWeight: 500, color: theme.colors.brand }}>
                {CEFR_DESCRIPTIONS[placementResult.level]}
              </Subtitle>
              <Subtitle style={{ fontSize: 13, marginTop: 12, lineHeight: 1.5 }}>
                {placementResult.reasoning}
              </Subtitle>
              <Badge $variant="neutral" style={{ marginTop: 10 }}>
                {ONBOARDING.resultConfidence(placementResult.confidence)}
              </Badge>
            </ResultCard>

            <div style={{ display: "flex", gap: 8 }}>
              <Button
                $variant="ghost"
                $fullWidth
                onClick={() => dispatch(retryPlacement())}
              >
                {ONBOARDING.resultRetry}
              </Button>
              <Button
                $fullWidth
                onClick={() => {
                  dispatch(setLevel(placementResult.level));
                  dispatch(setStep(OnboardingStep.Interests));
                }}
              >
                {ONBOARDING.resultAccept}
              </Button>
            </div>
          </>
        )}

        {step === OnboardingStep.Interests && (
          <>
            <div>
              <Heading>{ONBOARDING.interestsTitle}</Heading>
              <Subtitle>{ONBOARDING.interestsSubtitle}</Subtitle>
            </div>

            <OptionGrid $cols={1}>
              {INTERESTS.map((interest) => (
                <OptionButton
                  key={interest}
                  $selected={interests.includes(interest)}
                  onClick={() => dispatch(toggleInterest(interest))}
                >
                  {INTEREST_LABELS[interest]}
                </OptionButton>
              ))}
            </OptionGrid>

            <Footer>
              <Button
                $variant="ghost"
                $size="sm"
                onClick={() => dispatch(setStep(OnboardingStep.LevelChoice))}
              >
                {COMMON.back}
              </Button>
              <Button
                disabled={interests.length === 0}
                onClick={handleComplete}
              >
                {ONBOARDING.startLearning}
              </Button>
            </Footer>
          </>
        )}
      </Modal>
    </Overlay>
  );
};
