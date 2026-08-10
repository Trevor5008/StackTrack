import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';

export const styles = StyleSheet.create({
  // screen to handle the screen style
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  // content to handle the content style
  content: {
    // gap to handle the gap
    gap: spacing.lg,
    padding: spacing.md,
    // padding bottom to handle the padding bottom
    paddingBottom: spacing.xl,
  },
  // heading to handle the heading style
  heading: {
    // color to handle the color
    color: colors.text,
    // font size to handle the font size
    fontSize: 25,
    // font weight to handle the font weight
    fontWeight: '800',
  },
  // subtitle to handle the subtitle style
  subtitle: {
    // color to handle the color
    color: colors.textMuted,
    fontSize: 14,
    // line height to handle the line height
    lineHeight: 20,
    // margin top to handle the margin top
    marginTop: spacing.xs,
  },
  // card to handle the card style
  card: {
    // background color to handle the background color
    backgroundColor: colors.surface,
    // border color to handle the border color
    borderColor: colors.border,
    // border radius to handle the border radius
    borderRadius: radius.md,
    // border width to handle the border width
    borderWidth: 1,
    // gap to handle the gap
    gap: spacing.md,
    // padding to handle the padding
    padding: spacing.md,
  },
  // label to handle the label style
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  dataHelp: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryButtonPressed: {
    opacity: 0.8,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  dangerButton: {
    alignItems: 'center',
    borderColor: colors.negative,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  dangerButtonPressed: {
    opacity: 0.8,
  },
  dangerButtonText: {
    color: colors.negative,
    fontSize: 15,
    fontWeight: '700',
  },
  // currency row to handle the currency row style
  currencyRow: {
    // flex direction to handle the flex direction
    flexDirection: 'row',
    // flex wrap to handle the flex wrap
    flexWrap: 'wrap',
    // gap to handle the gap
    gap: spacing.sm,
  },
  currencyButton: {
    // border color to handle the border color
    borderColor: colors.border,
    // border radius to handle the border radius
    borderRadius: radius.sm,
    // border width to handle the border width
    borderWidth: 1,
    // padding horizontal to handle the padding horizontal
    paddingHorizontal: spacing.md,
    // padding vertical to handle the padding vertical
    paddingVertical: spacing.sm,
  },
  currencyButtonActive: {
    // background color to handle the background color
    backgroundColor: colors.primary,
    // border color to handle the border color
    borderColor: colors.primary,
  },
  currencyText: {
    // color to handle the color
    color: colors.textMuted,
    // font weight to handle the font weight
    fontWeight: '700',
  },
  // currency text active to handle the currency text active style
  currencyTextActive: {
    // color to handle the color
    color: colors.background,
  },
  message: {
    // font size to handle the font size
    fontSize: 13,
  },
  successMessage: {
    // color to handle the color
    color: colors.positive,
  },
  errorMessage: {
    // color to handle the color
    color: colors.negative,
  },
  saveButton: {
    // align items to handle the align items
    alignItems: 'center',
    // background color to handle the background color
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    minHeight: 50,
    justifyContent: 'center',
  },
  saveButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '800',
  },
  futureCard: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: spacing.lg,
  },
  futureLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  futureTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  futureText: {
    color: colors.textMuted,
    lineHeight: 21,
  },
});
