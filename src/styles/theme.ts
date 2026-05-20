"use client";

import { createGlobalStyle } from "styled-components";

export const theme = {
  colors: {
    bgPrimary: "#ffffff",
    bgSecondary: "#f8f7f4",
    bgTertiary: "#f0ede8",

    brand: "#5b4fcf",
    brandHover: "#4a3fb8",
    brandLight: "#eeedfb",
    brandText: "#3c3389",

    textPrimary: "#1a1a1a",
    textSecondary: "#6b6b6b",
    textMuted: "#a0a0a0",

    border: "rgba(0,0,0,0.08)",
    borderStrong: "rgba(0,0,0,0.15)",

    success: "#0f6e56",
    successBg: "#e1f5ee",
    warning: "#854f0b",
    warningBg: "#faeeda",
    danger: "#a32d2d",
    dangerBg: "#fcebeb",

    userBubble: "#5b4fcf",
    userBubbleText: "#ffffff",
    aiBubble: "#f0ede8",
    aiBubbleText: "#1a1a1a",
  },
  radii: {
    sm: "6px",
    md: "10px",
    lg: "14px",
    xl: "20px",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 3px rgba(0,0,0,0.06)",
    md: "0 4px 12px rgba(0,0,0,0.08)",
  },
  breakpoints: {
    mobile: "768px",
  },
  sidebar: {
    width: "240px",
  },
} as const;

export type AppTheme = typeof theme;

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body, #__next { height: 100%; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    background: ${theme.colors.bgSecondary};
    color: ${theme.colors.textPrimary};
    -webkit-font-smoothing: antialiased;
    line-height: 1.6;
  }

  button { cursor: pointer; font-family: inherit; }
  input, textarea { font-family: inherit; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${theme.colors.border}; border-radius: 99px; }
`;
