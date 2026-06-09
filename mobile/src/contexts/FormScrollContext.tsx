import { createContext, useContext } from 'react';
import type { View } from 'react-native';

type ScrollFieldIntoView = (fieldRef: View) => void;

export const FormScrollContext = createContext<ScrollFieldIntoView | null>(null);

export function useScrollFieldIntoView(): ScrollFieldIntoView | null {
  return useContext(FormScrollContext);
}
