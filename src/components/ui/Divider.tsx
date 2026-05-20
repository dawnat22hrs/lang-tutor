"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${theme.colors.border};
  margin: 8px 0;
`;
