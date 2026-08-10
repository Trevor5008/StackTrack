import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';

export const styles = StyleSheet.create({
  // card to handle the card style
  card: {
    flex: 1,
    minWidth: 145,
    // background color to handle the background color
    backgroundColor: colors.surface,
    // border color to handle the border color
    borderColor: colors.border,
    // border radius to handle the border radius
    borderRadius: radius.md,
    // border width to handle the border width
    borderWidth: 1,
    padding: spacing.md,
  },
  featured: {
    // min width to handle the min width
    minWidth: '100%',
    // padding vertical to handle the padding vertical
    paddingVertical: spacing.lg,
  },
  label: {
    // color to handle the color
    color: colors.textMuted,
    // font size to handle the font size
    fontSize: 12,
    // font weight to handle the font weight
    fontWeight: '600',
    // letter spacing to handle the letter spacing
    letterSpacing: 0.8,
    // margin bottom to handle the margin bottom
    marginBottom: spacing.sm,
    // text transform to handle the text transform
    textTransform: 'uppercase',
  },
  value: {
    // color to handle the color
    color: colors.text,
    // font size to handle the font size
    fontSize: 23,
    fontWeight: '700',
  },
  featuredValue: {
    // font size to handle the font size
    fontSize: 38,
  },
});
