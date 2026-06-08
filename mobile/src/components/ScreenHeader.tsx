import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';
import { fontFamily, spacing, typography } from '@/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, rightAction }: ScreenHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: colors.text, fontFamily: fontFamily.bold }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              { color: colors.textSecondary, fontFamily: fontFamily.regular },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightAction}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: typography.xl,
  },
  subtitle: {
    fontSize: typography.sm,
    marginTop: spacing.xs,
  },
});
