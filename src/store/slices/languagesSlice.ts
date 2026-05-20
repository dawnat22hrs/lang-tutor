import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { LanguageProfile, CEFRLevel, Interest } from "@/types";

interface LanguagesState {
  profiles: LanguageProfile[];
  activeLanguageId: string | null;
  loading: boolean;
}

const initialState: LanguagesState = {
  profiles: [],
  activeLanguageId: null,
  loading: true,
};

export const fetchLanguages = createAsyncThunk("languages/fetchAll", async () => {
  const res = await fetch("/api/languages");
  return (await res.json()) as LanguageProfile[];
});

export const createLanguage = createAsyncThunk(
  "languages/create",
  async (payload: {
    id: string;
    language: string;
    level: CEFRLevel;
    interests: Interest[];
  }) => {
    const res = await fetch("/api/languages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return (await res.json()) as LanguageProfile;
  }
);

export const removeLanguage = createAsyncThunk(
  "languages/remove",
  async (id: string) => {
    await fetch("/api/languages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return id;
  }
);

const languagesSlice = createSlice({
  name: "languages",
  initialState,
  reducers: {
    setActiveLanguage(state, action: PayloadAction<string>) {
      state.activeLanguageId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLanguages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLanguages.fulfilled, (state, action) => {
        state.profiles = action.payload;
        state.loading = false;
        if (!state.activeLanguageId && action.payload.length > 0) {
          state.activeLanguageId = action.payload[0].id;
        }
      })
      .addCase(createLanguage.fulfilled, (state, action) => {
        const exists = state.profiles.find((p) => p.id === action.payload.id);
        if (!exists) state.profiles.push(action.payload);
        state.activeLanguageId = action.payload.id;
      })
      .addCase(removeLanguage.fulfilled, (state, action) => {
        state.profiles = state.profiles.filter((p) => p.id !== action.payload);
        if (state.activeLanguageId === action.payload) {
          state.activeLanguageId = state.profiles[0]?.id ?? null;
        }
      });
  },
});

export const { setActiveLanguage } = languagesSlice.actions;
export default languagesSlice.reducer;
