import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardBest: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  main: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
  },
  bestRules: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  pnl: {
    fontSize: 14,
    fontWeight: '600',
  },
  pnlInline: {
    fontSize: 14,
    fontWeight: '600',
  },
  rorUnknown: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  rorLine: {
    fontSize: 12,
    fontWeight: '700',
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 16,
  },
  actions: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: spacing.sm,
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    justifyContent: 'center',
    minHeight: 40,
  },
  playButtonText: {
    color: colors.background,
    fontWeight: '800',
  },
  pauseButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
  },
  pauseButtonText: {
    color: colors.text,
    fontWeight: '700',
  },
  expanded: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    padding: spacing.md,
  },
  readOnly: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  rulesButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    gap: 2,
    justifyContent: 'center',
    marginTop: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  rulesButtonTitle: {
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  rulesButtonSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButton: {
    alignItems: 'center',
    borderColor: colors.negative,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  deleteButtonText: {
    color: colors.negative,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
