"use client";

import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setSidebarOpen } from "@/store/slices/uiSlice";
import { theme } from "@/styles/theme";

const Backdrop = styled.div<{ $visible: boolean }>`
  display: none;

  @media (max-width: ${theme.breakpoints.mobile}) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 40;
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    pointer-events: ${({ $visible }) => ($visible ? "all" : "none")};
    transition: opacity 0.25s;
  }
`;

export const MobileBackdrop = () => {
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((s) => s.ui);

  return (
    <Backdrop
      $visible={sidebarOpen}
      onClick={() => dispatch(setSidebarOpen(false))}
    />
  );
};
