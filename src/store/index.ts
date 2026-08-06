// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/ui-slice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    // add feature slices here as they come up (filters, selectedAssets, etc.)
    // keep server data (assets, users, licenses) OUT of Redux — that's
    // React Query's job. Redux only holds client-only UI state.
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;