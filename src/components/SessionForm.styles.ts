import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';

export const styles = StyleSheet.create({
  //
  // Styles for the session form.
  // @returns {StyleSheet}
  // @description This function is used to style the session form.
  // @example
  // <SessionForm onSubmit={handleSubmit} />
  //
  form: {
    gap: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.background,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowField: {
    flex: 1,
  },
  result: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  resultLabel: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  error: {
    color: colors.negative,
  },
  submit: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    minHeight: 50,
    justifyContent: 'center',
  },
  submitText: {
    color: colors.background,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
});
