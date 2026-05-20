"use client";

import React from "react";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import {
  Avatar,
  Heading,
  Subtitle,
  SectionLabel,
  StatCard,
  StatNumber,
  StatLabel,
} from "@/components/ui";
import { SessionFormat } from "@/types";
import type { LanguageProfile, ProgressSummary } from "@/types";
import { SESSION_FORMAT_LABELS, GREETING } from "@/lib/locale";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 32px 24px;
  max-width: 560px;
  margin: 0 auto;
`;

const Greeting = styled.div`
  text-align: center;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const FormatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;

const FormatCard = styled.button<{ $highlighted?: boolean }>`
  padding: 14px 16px;
  border-radius: ${theme.radii.lg};
  border: 1.5px solid
    ${({ $highlighted }) =>
      $highlighted ? theme.colors.brand : theme.colors.border};
  background: ${({ $highlighted }) =>
    $highlighted ? theme.colors.brandLight : theme.colors.bgPrimary};
  color: ${theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;

  &:hover {
    border-color: ${theme.colors.brand};
    background: ${theme.colors.brandLight};
  }
`;

const FormatDue = styled.span`
  position: absolute;
  top: 8px;
  right: 10px;
  font-size: 11px;
  background: ${theme.colors.brand};
  color: #fff;
  padding: 1px 6px;
  border-radius: 99px;
  font-weight: 600;
`;

const FORMATS = Object.values(SessionFormat);

interface Props {
  profile: LanguageProfile;
  progress: ProgressSummary | null;
  onSelectFormat: (format: SessionFormat) => void;
}

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return GREETING.morning;
  if (h < 18) return GREETING.afternoon;
  return GREETING.evening;
};

export const SessionGreeting = ({ profile, progress, onSelectFormat }: Props) => (
  <Wrapper>
    <Greeting>
      <Avatar $size={56} style={{ margin: "0 auto 16px" }}>T</Avatar>
      <Heading as="h1" style={{ fontSize: 22 }}>{getGreeting()}!</Heading>
      <Subtitle>
        {profile.language} · {profile.level} ·{" "}
        {progress?.streakDays
          ? GREETING.streak(progress.streakDays)
          : GREETING.startPrompt}
      </Subtitle>
    </Greeting>

    {progress && (
      <StatsRow>
        <StatCard>
          <StatNumber>{progress.totalWords}</StatNumber>
          <StatLabel>{GREETING.statsWords}</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber
            style={{
              color:
                progress.dueToday > 0
                  ? theme.colors.brand
                  : theme.colors.textPrimary,
            }}
          >
            {progress.dueToday}
          </StatNumber>
          <StatLabel>{GREETING.statsReview}</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{progress.totalSessions}</StatNumber>
          <StatLabel>{GREETING.statsSessions}</StatLabel>
        </StatCard>
      </StatsRow>
    )}

    {progress && progress.dueToday > 0 && (
      <div
        style={{
          background: theme.colors.brandLight,
          borderRadius: theme.radii.md,
          padding: "10px 14px",
          fontSize: 14,
          color: theme.colors.brandText,
        }}
      >
        {GREETING.duePrefix(progress.dueToday)}<strong>{GREETING.dueHighlight}</strong>.
      </div>
    )}

    <div>
      <SectionLabel>{GREETING.chooseFormat}</SectionLabel>
      <FormatGrid>
        {FORMATS.map((f) => (
          <FormatCard
            key={f}
            $highlighted={f === SessionFormat.Review && (progress?.dueToday ?? 0) > 0}
            onClick={() => onSelectFormat(f)}
          >
            {SESSION_FORMAT_LABELS[f]}
            {f === SessionFormat.Review && progress && progress.dueToday > 0 && (
              <FormatDue>{progress.dueToday}</FormatDue>
            )}
          </FormatCard>
        ))}
      </FormatGrid>
    </div>
  </Wrapper>
);
