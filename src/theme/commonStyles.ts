import { StyleSheet } from 'react-native';

import { colors, spacing } from '@/src/theme';

/** Shared screen chrome used across tabs and stack screens. */
export const commonStyles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  centered: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  error: {
    color: colors.negative,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
