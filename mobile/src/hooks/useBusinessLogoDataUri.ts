import { useEffect, useState } from 'react';

import { getBusinessLogoDataUri } from '@/services/businessLogoService';
import { useSettingsStore } from '@/store/settingsStore';

export function useBusinessLogoDataUri() {
  const logoUri = useSettingsStore((s) => s.settings.businessLogoUri);
  const [logoDataUri, setLogoDataUri] = useState<string | null>(null);

  useEffect(() => {
    if (!logoUri) {
      setLogoDataUri(null);
      return;
    }
    void getBusinessLogoDataUri(logoUri).then(setLogoDataUri);
  }, [logoUri]);

  return logoDataUri;
}
