import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';

// Styles for the casino screen
export const styles = StyleSheet.create({
  missing: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  eyebrowGap: {
    marginBottom: spacing.xs,
  },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  renameBlock: {
    gap: spacing.xs,
  },
  headingInput: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  renameHint: {
    color: colors.textMuted,
    fontSize: 12,
  },
  renameError: {
    color: colors.negative,
    fontSize: 12,
  },
  startButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 52,
  },
  startButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  section: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  modalHint: {
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  toleranceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  toleranceChip: {
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    minWidth: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  toleranceChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toleranceChipText: {
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  toleranceChipTextSelected: {
    color: colors.background,
  },
});

export default styles;
