"use client";

import styled, { css } from "styled-components";
import { theme } from "@/styles/theme";

interface AvatarProps {
  $size?: number;
}

export const Avatar = styled.div<AvatarProps>`
  ${({ $size = 40 }) => css`
    width: ${$size}px;
    height: ${$size}px;
    font-size: ${Math.round($size * 0.38)}px;
  `}
  border-radius: 50%;
  background: ${theme.colors.brandLight};
  color: ${theme.colors.brand};
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;
