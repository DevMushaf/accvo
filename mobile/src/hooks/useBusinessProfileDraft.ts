import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { InteractionManager } from 'react-native';

import { useSettingsStore } from '@/store/settingsStore';
import type { AppSettings } from '@/types/settings';

export type BusinessProfileDraft = Pick<
  AppSettings,
  | 'businessName'
  | 'businessTagline'
  | 'businessEmail'
  | 'businessPhone'
  | 'businessWebsite'
  | 'businessAddress'
>;

function pickBusinessProfile(settings: AppSettings): BusinessProfileDraft {
  return {
    businessName: settings.businessName,
    businessTagline: settings.businessTagline,
    businessEmail: settings.businessEmail,
    businessPhone: settings.businessPhone,
    businessWebsite: settings.businessWebsite,
    businessAddress: settings.businessAddress,
  };
}

/** Local draft for text fields — saves when you leave the screen, not on every keystroke. */
export function useBusinessProfileDraft() {
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const [draft, setDraft] = useState<BusinessProfileDraft>(() =>
    pickBusinessProfile(useSettingsStore.getState().settings),
  );
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const setField = useCallback(<K extends keyof BusinessProfileDraft>(key: K, value: BusinessProfileDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        setDraft(pickBusinessProfile(useSettingsStore.getState().settings));
      });
      return () => {
        task.cancel();
        void updateSettings(draftRef.current);
      };
    }, [updateSettings]),
  );

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  return { draft, setField };
}
