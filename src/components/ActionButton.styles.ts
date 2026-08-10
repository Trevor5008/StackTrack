import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';

export const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    borderColor: colors.border,
    borderWidth: 1,
  },
  danger: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.negative,
    borderWidth: 1,
  },
  label: {
    fontWeight: '800',
  },
  primaryLabel: {
    color: colors.background,
  },
  secondaryLabel: {
    color: colors.text,
    fontWeight: '700',
  },
  dangerLabel: {
    color: colors.negative,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
});
