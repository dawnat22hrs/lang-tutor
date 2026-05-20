"use client";

import styled, { css } from "styled-components";
import { theme } from "@/styles/theme";

interface BadgeProps {
  $variant?: "success" | "warning" | "danger" | "brand" | "neutral";
}

export const Badge = styled.span<BadgeProps>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: ${theme.radii.full};
  font-size: 12px;
  font-weight: 500;

  ${({ $variant = "neutral" }) => {
    switch ($variant) {
      case "success":
        return css`background: ${theme.colors.successBg}; color: ${theme.colors.success};`;
      case "warning":
        return css`background: ${theme.colors.warningBg}; color: ${theme.colors.warning};`;
      case "danger":
        return css`background: ${theme.colors.dangerBg}; color: ${theme.colors.danger};`;
      case "brand":
        return css`background: ${theme.colors.brandLight}; color: ${theme.colors.brandText};`;
      case "neutral":
        return css`background: ${theme.colors.bgTertiary}; color: ${theme.colors.textSecondary};`;
    }
  }}
`;
