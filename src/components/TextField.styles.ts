import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';

export const styles = StyleSheet.create({
  /**
   * Styles for the outer field wrapper.
   */
  field: {
    gap: spacing.xs,
  },
  /**
   * Styles for the label.
   */
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  inputRow: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 44,
    paddingRight: spacing.xs,
  },
  inputRowMultiline: {
    alignItems: 'flex-start',
  },
  input: {
    color: colors.text,
    flex: 1,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  dismissButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  dismissButtonMultiline: {
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
});
