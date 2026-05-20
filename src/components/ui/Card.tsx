"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";

export const Card = styled.div`
  background: ${theme.colors.bgPrimary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 16px 20px;
`;
