import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { useTheme } from '@/providers/ThemeProvider';
import { pickAndSaveBusinessLogo, removeBusinessLogo } from '@/services/businessLogoService';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily, spacing, typography } from '@/theme';

export function BusinessLogoSection() {
  const { colors } = useTheme();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const isWide = settings.businessLogoShape === 'wide';

  async function handlePickLogo() {
    try {
      const result = await pickAndSaveBusinessLogo();
      if (result) {
        await updateSettings({
          businessLogoUri: result.uri,
          businessLogoShape: result.shape,
          showLogoOnInvoice: true,
          showLogoOnBusinessCard: true,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not add logo.';
      Alert.alert('Logo', message);
    }
  }

  async function handleRemoveLogo() {
    await removeBusinessLogo(settings.businessLogoUri);
    await updateSettings({
      businessLogoUri: null,
      businessLogoShape: 'square',
      showLogoOnInvoice: false,
      showLogoOnBusinessCard: false,
    });
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.text, fontFamily: fontFamily.medium }]}>
        Business logo (optional)
      </Text>
      <Text style={[styles.hint, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
        Square or wide logos supported. Wide wordmarks work best for horizontal layouts.
      </Text>

      {settings.businessLogoUri ? (
        <View
          style={[
            styles.previewBox,
            isWide ? styles.previewBoxWide : styles.previewBoxSquare,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <Image source={{ uri: settings.businessLogoUri }} style={styles.previewImage} resizeMode="contain" />
        </View>
      ) : (
        <View style={[styles.placeholder, { borderColor: colors.border, backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.placeholderText, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
            No logo added
          </Text>
        </View>
      )}

      <View style={styles.row}>
        <Button
          title={settings.businessLogoUri ? 'Change logo' : 'Add logo'}
          variant="secondary"
          fullWidth={false}
          onPress={() => void handlePickLogo()}
          style={styles.rowBtn}
        />
        {settings.businessLogoUri ? (
          <Button
            title="Remove"
            variant="ghost"
            fullWidth={false}
            onPress={() => void handleRemoveLogo()}
            style={styles.rowBtn}
          />
        ) : null}
      </View>

      {settings.businessLogoUri ? (
        <View style={styles.toggles}>
          <ToggleRow
            label="Show on invoices"
            active={settings.showLogoOnInvoice}
            onPress={() => void updateSettings({ showLogoOnInvoice: !settings.showLogoOnInvoice })}
          />
          <ToggleRow
            label="Show on business card"
            active={settings.showLogoOnBusinessCard}
            onPress={() => void updateSettings({ showLogoOnBusinessCard: !settings.showLogoOnBusinessCard })}
          />
        </View>
      ) : null}
    </View>
  );
}

function ToggleRow({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.toggle,
        {
          borderColor: active ? colors.primary : colors.border,
          backgroundColor: active ? colors.primaryLight : colors.surface,
        },
      ]}
    >
      <View style={[styles.check, { backgroundColor: active ? colors.primary : 'transparent', borderColor: colors.primary }]}>
        {active ? <Text style={styles.checkMark}>✓</Text> : null}
      </View>
      <Text style={[styles.toggleLabel, { color: colors.text, fontFamily: fontFamily.medium }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  label: { fontSize: typography.sm, marginBottom: spacing.xs },
  hint: { fontSize: typography.sm, lineHeight: 20, marginBottom: spacing.sm },
  previewBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  previewBoxSquare: {
    width: 88,
    height: 88,
  },
  previewBoxWide: {
    width: 160,
    height: 56,
  },
  previewImage: { width: '100%', height: '100%' },
  placeholder: {
    width: '100%',
    height: 72,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  placeholderText: { fontSize: typography.sm },
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  rowBtn: { flex: 1 },
  toggles: { gap: spacing.sm },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    minHeight: 48,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  toggleLabel: { fontSize: typography.sm },
});
