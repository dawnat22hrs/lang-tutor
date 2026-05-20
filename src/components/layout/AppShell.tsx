"use client";

import React, { useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchLanguages } from "@/store/slices/languagesSlice";
import { GlobalStyle } from "@/styles/theme";
import { Sidebar } from "@/components/features/sidebar/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileBackdrop } from "@/components/layout/MobileBackdrop";
import { Chat } from "@/components/features/chat/Chat";
import { OnboardingWizard } from "@/components/features/onboarding/OnboardingWizard";
import { ErrorBoundary } from "@/components/providers/ErrorBoundary";

const AppLayout = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const MainArea = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
`;

export const AppShell = () => {
  const dispatch = useAppDispatch();
  const { profiles, loading } = useAppSelector((s) => s.languages);
  const { showAddLanguage } = useAppSelector((s) => s.ui);

  useEffect(() => {
    dispatch(fetchLanguages());
  }, [dispatch]);

  const isFirstRun = !loading && profiles.length === 0;

  return (
    <>
      <GlobalStyle />
      <AppLayout>
        <Sidebar />
        <MobileBackdrop />

        <MainArea>
          <Header />
          <ErrorBoundary>
            <Chat />
          </ErrorBoundary>
        </MainArea>
      </AppLayout>

      {(isFirstRun || showAddLanguage) && (
        <OnboardingWizard isFirstRun={isFirstRun} />
      )}
    </>
  );
};

export default AppShell;
