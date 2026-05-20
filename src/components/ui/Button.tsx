"use client";

import styled, { css } from "styled-components";
import { theme } from "@/styles/theme";

interface ButtonProps {
  $variant?: "primary" | "ghost" | "danger";
  $size?: "sm" | "md";
  $fullWidth?: boolean;
}

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-radius: ${theme.radii.md};
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s, transform 0.1s, opacity 0.15s;
  white-space: nowrap;
  cursor: pointer;

  ${({ $size = "md" }) =>
    $size === "sm"
      ? css`padding: 6px 12px; font-size: 13px;`
      : css`padding: 9px 18px;`}

  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}

  ${({ $variant = "primary" }) => {
    switch ($variant) {
      case "primary":
        return css`
          background: ${theme.colors.brand};
          color: #fff;
          &:hover:not(:disabled) { background: ${theme.colors.brandHover}; }
          &:active:not(:disabled) { transform: scale(0.98); }
        `;
      case "ghost":
        return css`
          background: transparent;
          color: ${theme.colors.textSecondary};
          border: 1px solid ${theme.colors.border};
          &:hover:not(:disabled) { background: ${theme.colors.bgTertiary}; }
          &:active:not(:disabled) { transform: scale(0.98); }
        `;
      case "danger":
        return css`
          background: ${theme.colors.dangerBg};
          color: ${theme.colors.danger};
          &:hover:not(:disabled) { opacity: 0.85; }
        `;
    }
  }}

  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;
