import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarOpen: boolean;
  showAddLanguage: boolean;
  progressRefreshKey: number;
}

const initialState: UIState = {
  sidebarOpen: false,
  showAddLanguage: false,
  progressRefreshKey: 0,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    openAddLanguage(state) {
      state.showAddLanguage = true;
    },
    closeAddLanguage(state) {
      state.showAddLanguage = false;
    },
    invalidateProgress(state) {
      state.progressRefreshKey += 1;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openAddLanguage,
  closeAddLanguage,
  invalidateProgress,
} = uiSlice.actions;
export default uiSlice.reducer;
