import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';

export const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 2,
    minWidth: 52,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 28,
    minWidth: 48,
    paddingHorizontal: spacing.sm,
  },
  badgeBest: {
    borderWidth: 2,
  },
  text: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  bestCaption: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
