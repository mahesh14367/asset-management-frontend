// src/hooks/redux.ts
// Typed versions of useDispatch/useSelector — use these everywhere instead
// of the raw react-redux hooks, so TypeScript knows your state shape.
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;