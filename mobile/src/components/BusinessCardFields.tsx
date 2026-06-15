import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Input } from '@/components/Input';
import type { BusinessCardDraft } from '@/hooks/useBusinessCardDraft';
import { useTheme } from '@/providers/ThemeProvider';
import { fontFamily, spacing, typography } from '@/theme';

type FieldChange = <K extends keyof BusinessCardDraft>(key: K, value: BusinessCardDraft[K]) => void;

interface SectionProps {
  draft: BusinessCardDraft;
  onChange: FieldChange;
}

function FieldHint({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.fieldHint, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
      {children}
    </Text>
  );
}

export function BusinessCardFrontFields({ draft, onChange }: SectionProps) {
  return (
    <>
      <FieldHint>Company name and slogan on the front of the card.</FieldHint>
      <Input
        label="Company name"
        value={draft.businessName}
        onChangeText={(v) => onChange('businessName', v)}
        placeholder="Company Name"
      />
      <Input
        label="Slogan"
        value={draft.businessTagline}
        onChangeText={(v) => onChange('businessTagline', v)}
        placeholder="Slogan here"
      />
      <Input
        label="Website (optional, shown on front)"
        value={draft.businessWebsite}
        onChangeText={(v) => onChange('businessWebsite', v)}
        placeholder="www.yourwebsite.com"
        autoCapitalize="none"
      />
    </>
  );
}

export function BusinessCardPersonFields({ draft, onChange }: SectionProps) {
  return (
    <>
      <FieldHint>Name and title on the back of the card.</FieldHint>
      <Input
        label="Your name"
        value={draft.businessCardPersonName}
        onChangeText={(v) => onChange('businessCardPersonName', v)}
        placeholder="Richard Miles"
      />
      <Input
        label="Your title"
        value={draft.businessCardPersonTitle}
        onChangeText={(v) => onChange('businessCardPersonTitle', v)}
        placeholder="Landscape Design"
      />
    </>
  );
}

export function BusinessCardContactFields({ draft, onChange }: SectionProps) {
  return (
    <>
      <FieldHint>Phone, email, and address on the back of the card.</FieldHint>
      <Input
        label="Phone"
        value={draft.businessPhone}
        onChangeText={(v) => onChange('businessPhone', v)}
        placeholder="+1 555 000 0000"
        keyboardType="phone-pad"
      />
      <Input
        label="Email"
        value={draft.businessEmail}
        onChangeText={(v) => onChange('businessEmail', v)}
        placeholder="hello@company.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        label="Address"
        value={draft.businessAddress}
        onChangeText={(v) => onChange('businessAddress', v)}
        placeholder="Street, City, State"
        multiline
        numberOfLines={2}
        style={{ minHeight: 56, textAlignVertical: 'top' }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fieldHint: {
    fontSize: typography.xs,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
});
