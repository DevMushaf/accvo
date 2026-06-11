import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { InteractionManager } from 'react-native';

import { useSettingsStore } from '@/store/settingsStore';
import type { AppSettings } from '@/types/settings';

export type BusinessCardDraft = Pick<
  AppSettings,
  | 'businessName'
  | 'businessTagline'
  | 'businessCardPersonName'
  | 'businessCardPersonTitle'
  | 'businessPhone'
  | 'businessEmail'
  | 'businessWebsite'
  | 'businessAddress'
>;

function pickBusinessCardDraft(settings: AppSettings): BusinessCardDraft {
  return {
    businessName: settings.businessName,
    businessTagline: settings.businessTagline,
    businessCardPersonName: settings.businessCardPersonName,
    businessCardPersonTitle: settings.businessCardPersonTitle,
    businessPhone: settings.businessPhone,
    businessEmail: settings.businessEmail,
    businessWebsite: settings.businessWebsite,
    businessAddress: settings.businessAddress,
  };
}

/** Card-only draft — saves when you leave the business card screen. */
export function useBusinessCardDraft() {
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const [draft, setDraft] = useState<BusinessCardDraft>(() =>
    pickBusinessCardDraft(useSettingsStore.getState().settings),
  );
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const setField = useCallback(<K extends keyof BusinessCardDraft>(key: K, value: BusinessCardDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        setDraft(pickBusinessCardDraft(useSettingsStore.getState().settings));
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
