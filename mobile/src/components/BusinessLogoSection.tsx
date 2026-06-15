import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import type { ImageData } from 'expo-dynamic-image-crop';

import { Button } from '@/components/Button';
import { LogoCropModal } from '@/components/LogoCropModal';
import { LogoSizeSlider } from '@/components/LogoSizeSlider';
import { useTheme } from '@/providers/ThemeProvider';
import {
  fitLogoDimensions,
  LOGO_PREVIEW_MAX,
  pickLogoImage,
  removeBusinessLogo,
  saveCroppedLogo,
} from '@/services/businessLogoService';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily, spacing, typography } from '@/theme';

interface BusinessLogoSectionProps {
  /** Card screen hides invoice options and logo size slider. */
  variant?: 'settings' | 'card';
}

export function BusinessLogoSection({ variant = 'settings' }: BusinessLogoSectionProps) {
  const isCard = variant === 'card';
  const { colors } = useTheme();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const [cropUri, setCropUri] = useState<string | null>(null);
  const [cropVisible, setCropVisible] = useState(false);

  async function handlePickLogo() {
    try {
      const uri = await pickLogoImage();
      if (uri) {
        setCropUri(uri);
        setCropVisible(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not add logo.';
      Alert.alert('Logo', message);
    }
  }

  async function handleCropComplete(data: ImageData) {
    try {
      const result = await saveCroppedLogo(data.uri);
      await updateSettings({
        businessLogoUri: result.uri,
        businessLogoShape: result.shape,
        businessLogoWidth: result.width,
        businessLogoHeight: result.height,
        businessLogoRevision: Date.now(),
        ...(isCard ? {} : { showLogoOnInvoice: true }),
        showLogoOnBusinessCard: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save logo.';
      Alert.alert('Logo', message);
    } finally {
      setCropVisible(false);
      setCropUri(null);
    }
  }

  function handleCropCancel() {
    setCropVisible(false);
    setCropUri(null);
  }

  async function handleRemoveLogo() {
    await removeBusinessLogo(settings.businessLogoUri);
    await updateSettings({
      businessLogoUri: null,
      businessLogoShape: 'square',
      businessLogoWidth: null,
      businessLogoHeight: null,
      businessLogoRevision: Date.now(),
      ...(isCard
        ? { showLogoOnBusinessCard: false }
        : {
            businessLogoScale: 1,
            showLogoOnInvoice: false,
            showLogoOnBusinessCard: false,
          }),
    });
  }

  const logoScale = settings.businessLogoScale ?? 1;

  function handleScaleChange(scale: number) {
    useSettingsStore.setState((state) => ({
      settings: { ...state.settings, businessLogoScale: scale },
    }));
  }

  function handleScaleComplete(scale: number) {
    void updateSettings({ businessLogoScale: scale });
  }

  const previewSize =
    settings.businessLogoWidth && settings.businessLogoHeight
      ? (() => {
          const fitted = fitLogoDimensions(
            settings.businessLogoWidth,
            settings.businessLogoHeight,
            LOGO_PREVIEW_MAX,
            LOGO_PREVIEW_MAX,
          );
          return {
            width: Math.round(fitted.width * logoScale),
            height: Math.round(fitted.height * logoScale),
          };
        })()
      : { width: LOGO_PREVIEW_MAX, height: LOGO_PREVIEW_MAX };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.text, fontFamily: fontFamily.medium }]}>
        {isCard ? 'Card logo (optional)' : 'Business logo (optional)'}
      </Text>
      <Text
        style={[
          isCard ? styles.hintCard : styles.hint,
          { color: colors.textSecondary, fontFamily: fontFamily.regular },
        ]}
      >
        {isCard
          ? 'Appears on the front and back of your card. Crop to a square or wide mark.'
          : 'Choose a photo, then drag the crop corners to any size. Pinch to zoom and pan the image.'}
      </Text>

      {settings.businessLogoUri ? (
        <View
          style={[
            styles.previewBox,
            {
              width: previewSize.width,
              height: previewSize.height,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <Image
            source={{ uri: `${settings.businessLogoUri}?rev=${settings.businessLogoRevision}` }}
            style={styles.previewImage}
            resizeMode="contain"
          />
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
          {!isCard ? (
            <LogoSizeSlider
              value={logoScale}
              onValueChange={handleScaleChange}
              onSlidingComplete={handleScaleComplete}
            />
          ) : null}
          {!isCard ? (
            <ToggleRow
              label="Show on invoices"
              active={settings.showLogoOnInvoice}
              onPress={() => void updateSettings({ showLogoOnInvoice: !settings.showLogoOnInvoice })}
            />
          ) : null}
          <ToggleRow
            label={isCard ? 'Show logo on card' : 'Show on business card'}
            active={settings.showLogoOnBusinessCard}
            onPress={() => void updateSettings({ showLogoOnBusinessCard: !settings.showLogoOnBusinessCard })}
          />
        </View>
      ) : null}

      <LogoCropModal
        visible={cropVisible}
        imageUri={cropUri}
        onComplete={(data) => void handleCropComplete(data)}
        onCancel={handleCropCancel}
      />
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
  hintCard: { fontSize: typography.xs, lineHeight: 18, marginBottom: spacing.sm },
  previewBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
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
