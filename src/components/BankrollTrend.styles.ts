import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';

export const styles = StyleSheet.create({
  // card to handle the card style
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  // heading to handle the heading style
  heading: {
    // align items to handle the align items
    alignItems: 'baseline',
    // flex direction to handle the flex direction
    flexDirection: 'row',
    // justify content to handle the justify content
    justifyContent: 'space-between',
  },
  // title to handle the title style
  title: {
    // color to handle the color
    color: colors.text,
    // font size to handle the font size
    fontSize: 17,
    // font weight to handle the font weight
    fontWeight: '700',
  },
  // caption to handle the caption style
  caption: {
    // color to handle the color
    color: colors.textMuted,
    // font size to handle the font size
    fontSize: 12,
  },
  chart: {
    // align items to handle the align items
    alignItems: 'center',
    // flex direction to handle the flex direction
    flexDirection: 'row',
    // height to handle the height
    height: 100,
    // margin vertical to handle the margin vertical
    marginVertical: spacing.md,
    // position to handle the position
    position: 'relative',
  },
  axis: {
    // background color to handle the background color
    backgroundColor: colors.border,
    // height to handle the height
    height: 1,
    // left to handle the left
    left: 0,
    // position to handle the position
    position: 'absolute',
    // right to handle the right
    right: 0,
    // top to handle the top
    top: 49,
  },
  barColumn: {
    // flex to handle the flex
    flex: 1,
    // height to handle the height
    height: 90,
    // padding horizontal to handle the padding horizontal
    paddingHorizontal: 3,
    // position to handle the position
    position: 'relative',
  },
  bar: {
    // border radius to handle the border radius
    borderRadius: radius.sm,
    // left to handle the left
    left: 3,
    // position to handle the position
    position: 'absolute',
    // right to handle the right
    right: 3,
  },
  positiveBar: {
    // background color to handle the background color
    backgroundColor: colors.positive,
    // bottom to handle the bottom
    bottom: 45,
  },
  negativeBar: {
    // background color to handle the background color
    backgroundColor: colors.negative,
  },
  empty: {
    // color to handle the color
    color: colors.textMuted,
    // padding vertical to handle the padding vertical
    paddingVertical: spacing.xl,
    // text align to handle the text align
    textAlign: 'center',
  },
  todo: {
    // color to handle the color
    color: colors.textMuted,
    // font size to handle the font size
    fontSize: 11,
  },
});
