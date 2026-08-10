import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';

export const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  bannerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  timer: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  cta: {
    color: colors.primary,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
  },
});
