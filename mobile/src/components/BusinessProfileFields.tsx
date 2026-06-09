import { Input } from '@/components/Input';
import type { BusinessProfileDraft } from '@/hooks/useBusinessProfileDraft';

interface BusinessProfileFieldsProps {
  draft: BusinessProfileDraft;
  onChange: <K extends keyof BusinessProfileDraft>(key: K, value: BusinessProfileDraft[K]) => void;
}

export function BusinessProfileFields({ draft, onChange }: BusinessProfileFieldsProps) {
  return (
    <>
      <Input
        label="Business name"
        value={draft.businessName}
        onChangeText={(v) => onChange('businessName', v)}
        placeholder="My Business"
      />
      <Input
        label="Tagline"
        value={draft.businessTagline}
        onChangeText={(v) => onChange('businessTagline', v)}
        placeholder="Professional services"
      />
      <Input
        label="Email"
        value={draft.businessEmail}
        onChangeText={(v) => onChange('businessEmail', v)}
        placeholder="hello@mybusiness.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        label="Phone"
        value={draft.businessPhone}
        onChangeText={(v) => onChange('businessPhone', v)}
        placeholder="+1 555 000 0000"
        keyboardType="phone-pad"
      />
      <Input
        label="Website"
        value={draft.businessWebsite}
        onChangeText={(v) => onChange('businessWebsite', v)}
        placeholder="www.mybusiness.com"
        autoCapitalize="none"
      />
      <Input
        label="Address"
        value={draft.businessAddress}
        onChangeText={(v) => onChange('businessAddress', v)}
        placeholder="City, Country"
      />
    </>
  );
}
