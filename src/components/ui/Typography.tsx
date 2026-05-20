"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";

export const Heading = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

export const Subtitle = styled.p`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  margin-top: 4px;
`;

export const SectionLabel = styled.p`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${theme.colors.textMuted};
  margin-bottom: 8px;
`;

export const Caption = styled.span`
  font-size: 12px;
  color: ${theme.colors.textMuted};
`;
