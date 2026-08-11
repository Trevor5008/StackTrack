import { StyleSheet } from 'react-native';

import { colors, spacing } from '@/src/theme';

// Styles for the not found screen
const styles = StyleSheet.create({
  // container to handle the container style
  container: {
    // flex to handle the flex
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    // justify content to handle the justify content
    justifyContent: 'center',
    // padding to handle the padding
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  link: {
    // margin top to handle the margin top
    marginTop: spacing.md,
    // padding vertical to handle the padding vertical
    paddingVertical: spacing.md,
  },
  linkText: {
    // color to handle the color
    fontSize: 14,
    // font weight to handle the font weight
    color: colors.primary,
    fontWeight: '700',
  },
});

export default styles;
