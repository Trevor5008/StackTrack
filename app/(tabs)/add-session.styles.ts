import { StyleSheet } from 'react-native';

import { colors, spacing } from '@/src/theme';

// Styles for the add session screen
export const styles = StyleSheet.create({
  // screen to handle the screen style
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  // content to handle the content style
  content: {
    gap: spacing.lg,
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  // heading to handle the heading style
  heading: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  // subtitle to handle the subtitle style
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
export default styles;