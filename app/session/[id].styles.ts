import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';

export const styles = StyleSheet.create({
  notFoundTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  editHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heading: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  location: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  date: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  netResult: {
    fontSize: 42,
    fontWeight: '800',
    marginTop: spacing.lg,
  },
  netLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  detailRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 23,
  },
  metadata: {
    gap: spacing.xs,
  },
  metadataText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  actions: {
    gap: spacing.sm,
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    minHeight: 50,
    justifyContent: 'center',
  },
  editButtonText: {
    color: colors.background,
    fontWeight: '800',
  },
  deleteButton: {
    alignItems: 'center',
    borderColor: colors.negative,
    borderRadius: radius.sm,
    borderWidth: 1,
    minHeight: 50,
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: colors.negative,
    fontWeight: '700',
  },
});
