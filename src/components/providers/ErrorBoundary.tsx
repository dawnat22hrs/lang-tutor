"use client";

import React from "react";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import { Button } from "@/components/ui";
import { COMMON } from "@/lib/locale";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 100%;
  min-height: 200px;
  padding: 32px;
  text-align: center;
  color: ${theme.colors.textSecondary};
`;

const Title = styled.p`
  font-size: 15px;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const Message = styled.p`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  private handleReset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <Wrapper>
          <Title>{COMMON.errorTitle}</Title>
          <Message>{this.state.error.message}</Message>
          <Button $variant="ghost" $size="sm" onClick={this.handleReset}>
            {COMMON.retry}
          </Button>
        </Wrapper>
      );
    }

    return this.props.children;
  }
}
