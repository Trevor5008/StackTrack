import { StyleSheet } from 'react-native';

import { colors, spacing } from '@/src/theme';

export const styles = StyleSheet.create({
  // screen to handle the screen style
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  // content to handle the content style
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  // empty content to handle the empty content style
  emptyContent: {
    flexGrow: 1,
  },
  // separator to handle the separator style
  separator: {
    height: spacing.sm,
  },
  // empty to handle the empty style
  empty: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  // empty title to handle the empty title style
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  // empty text to handle the empty text style
  emptyText: {
    color: colors.textMuted,
    // text align to handle the text align
    textAlign: 'center',
  },
});
