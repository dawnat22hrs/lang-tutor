import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MessageRole } from "@/types";
import type { CEFRLevel, Interest, PlacementResult, ChatMessage } from "@/types";

export enum OnboardingStep {
  Language        = "language",
  LevelChoice     = "level-choice",
  Placement       = "placement",
  PlacementResult = "placement-result",
  Interests       = "interests",
  Done            = "done",
}

interface OnboardingState {
  step: OnboardingStep;
  language: string;
  level: CEFRLevel | null;
  interests: Interest[];
  placementMessages: ChatMessage[];
  placementResult: PlacementResult | null;
  placementStreaming: boolean;
}

const initialState: OnboardingState = {
  step: OnboardingStep.Language,
  language: "",
  level: null,
  interests: [],
  placementMessages: [],
  placementResult: null,
  placementStreaming: false,
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<OnboardingStep>) {
      state.step = action.payload;
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
    setLevel(state, action: PayloadAction<CEFRLevel>) {
      state.level = action.payload;
    },
    toggleInterest(state, action: PayloadAction<Interest>) {
      const idx = state.interests.indexOf(action.payload);
      if (idx === -1) state.interests.push(action.payload);
      else state.interests.splice(idx, 1);
    },
    addPlacementMessage(state, action: PayloadAction<ChatMessage>) {
      state.placementMessages.push(action.payload);
    },
    appendToLastPlacement(state, action: PayloadAction<string>) {
      const last = state.placementMessages[state.placementMessages.length - 1];
      if (last?.role === MessageRole.Assistant) last.content += action.payload;
    },
    setPlacementResult(state, action: PayloadAction<PlacementResult>) {
      state.placementResult = action.payload;
      state.step = OnboardingStep.PlacementResult;
    },
    setPlacementStreaming(state, action: PayloadAction<boolean>) {
      state.placementStreaming = action.payload;
    },
    retryPlacement(state) {
      state.placementMessages = [];
      state.placementResult = null;
      state.step = OnboardingStep.Placement;
    },
    reset() {
      return initialState;
    },
  },
});

export const {
  setStep,
  setLanguage,
  setLevel,
  toggleInterest,
  addPlacementMessage,
  appendToLastPlacement,
  setPlacementResult,
  setPlacementStreaming,
  retryPlacement,
  reset,
} = onboardingSlice.actions;
export default onboardingSlice.reducer;
