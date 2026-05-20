"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";

export const LoadingDots = styled.span`
  display: inline-flex;
  gap: 4px;
  align-items: center;

  &::before, &::after, span {
    content: '';
    display: block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${theme.colors.textMuted};
    animation: bounce 1.2s infinite;
  }
  &::before { animation-delay: 0s; }
  span { animation-delay: 0.2s; }
  &::after { animation-delay: 0.4s; }

  @keyframes bounce {
    0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
    40% { opacity: 1; transform: scale(1); }
  }
`;
