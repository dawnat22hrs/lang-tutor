"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";

const inputBase = `
  width: 100%;
  padding: 10px 14px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 15px;
  background: ${theme.colors.bgPrimary};
  color: ${theme.colors.textPrimary};
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder { color: ${theme.colors.textMuted}; }
  &:focus {
    outline: none;
    border-color: ${theme.colors.brand};
    box-shadow: 0 0 0 3px ${theme.colors.brandLight};
  }
`;

export const TextInput = styled.input`${inputBase}`;

export const Textarea = styled.textarea`
  ${inputBase}
  resize: none;
  line-height: 1.5;
`;
