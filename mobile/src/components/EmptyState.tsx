import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { useTheme } from '@/providers/ThemeProvider';
import { fontFamily, spacing, typography } from '@/theme';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/logo-icon-only.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={[styles.title, { color: colors.text, fontFamily: fontFamily.semibold }]}>
        {title}
      </Text>
      <Text
        style={[styles.message, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}
      >
        {message}
      </Text>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button title={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: spacing.lg,
    opacity: 0.95,
  },
  title: {
    fontSize: typography.lg,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  action: {
    width: '100%',
    marginTop: spacing.lg,
  },
});
