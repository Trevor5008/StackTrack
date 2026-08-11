import { Platform, StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';

// Styles for the live screen
export const styles = StyleSheet.create({
  // empty title to handle the empty title style
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  emptyBody: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  banner: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  casinoName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  timer: {
    color: colors.text,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 40,
    fontWeight: '700',
  },
  timerHint: {
    color: colors.textMuted,
    fontSize: 13,
  },
  bannerStats: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  bannerStat: {
    flex: 1,
    gap: spacing.xs,
  },
  bannerLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  bannerValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyTables: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  tableList: {
    gap: spacing.sm,
  },
  discardLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  discardText: {
    color: colors.textMuted,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  hoursReadOnly: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  confirmTables: {
    gap: 2,
    marginTop: spacing.xs,
  },
});

export default styles;