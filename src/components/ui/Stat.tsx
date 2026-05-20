"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";

export const StatCard = styled.div`
  background: ${theme.colors.bgSecondary};
  border-radius: ${theme.radii.md};
  padding: 10px;
  text-align: center;
`;

export const StatNumber = styled.p`
  font-size: 22px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
  line-height: 1.2;
`;

export const StatLabel = styled.p`
  font-size: 11px;
  color: ${theme.colors.textMuted};
  margin-top: 2px;
`;
