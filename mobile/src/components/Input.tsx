import React, { useRef } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useScrollFieldIntoView } from '@/contexts/FormScrollContext';
import { useTheme } from '@/providers/ThemeProvider';
import { fontFamily, radius, spacing, typography } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, onFocus, ...props }: InputProps) {
  const { colors } = useTheme();
  const wrapperRef = useRef<View>(null);
  const scrollFieldIntoView = useScrollFieldIntoView();

  return (
    <View ref={wrapperRef} style={styles.wrapper} collapsable={false}>
      {label ? (
        <Text style={[styles.label, { color: colors.text, fontFamily: fontFamily.medium }]}>
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textSecondary}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
            color: colors.text,
            fontFamily: fontFamily.regular,
          },
          style,
        ]}
        onFocus={(event) => {
          onFocus?.(event);
          if (scrollFieldIntoView && wrapperRef.current) {
            setTimeout(() => {
              if (wrapperRef.current) scrollFieldIntoView(wrapperRef.current);
            }, 100);
          }
        }}
        {...props}
      />
      {error ? (
        <Text style={[styles.error, { color: colors.error, fontFamily: fontFamily.regular }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sm,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: typography.base,
    minHeight: 48,
  },
  error: {
    fontSize: typography.xs,
    marginTop: spacing.xs,
  },
});
