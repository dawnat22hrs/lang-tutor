"use client";

import React from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { theme } from "@/styles/theme";
import { Badge, Avatar, Caption } from "@/components/ui";
import { SESSION_FORMAT_LABELS, COMMON } from "@/lib/locale";
import { SessionFormat } from "@/types";

const HeaderBar = styled.header`
  height: 52px;
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  background: ${theme.colors.bgPrimary};
  flex-shrink: 0;
`;

const BurgerButton = styled.button`
  display: none;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  border: none;
  background: none;
  border-radius: ${theme.radii.sm};
  cursor: pointer;

  span {
    display: block;
    width: 18px;
    height: 2px;
    background: ${theme.colors.textPrimary};
    border-radius: 99px;
    transition: all 0.2s;
  }

  &:hover { background: ${theme.colors.bgTertiary}; }

  @media (max-width: ${theme.breakpoints.mobile}) {
    display: flex;
  }
`;

const TitleArea = styled.div`
  flex: 1;
  min-width: 0;
`;

const LanguageName = styled.p`
  font-size: 15px;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Header = () => {
  const dispatch = useAppDispatch();
  const { profiles, activeLanguageId } = useAppSelector((s) => s.languages);
  const { formatByLanguage } = useAppSelector((s) => s.chat);

  const activeProfile = profiles.find((p) => p.id === activeLanguageId);
  const format = activeLanguageId
    ? formatByLanguage[activeLanguageId] ?? SessionFormat.Review
    : null;

  return (
    <HeaderBar>
      <BurgerButton
        onClick={() => dispatch(toggleSidebar())}
        aria-label={COMMON.openMenu}
      >
        <span />
        <span />
        <span />
      </BurgerButton>

      <Avatar $size={30}>T</Avatar>

      <TitleArea>
        <LanguageName>
          {activeProfile ? activeProfile.language : "Tutor"}
        </LanguageName>
        {activeProfile && format && (
          <Caption as="p">
            {activeProfile.level} · {SESSION_FORMAT_LABELS[format]}
          </Caption>
        )}
      </TitleArea>

      {activeProfile && (
        <Badge $variant="brand">{activeProfile.level}</Badge>
      )}
    </HeaderBar>
  );
};
