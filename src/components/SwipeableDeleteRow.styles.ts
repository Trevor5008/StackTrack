import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';

export const styles = StyleSheet.create({
  deleteAction: {
    alignItems: 'center',
    backgroundColor: colors.negative,
    borderRadius: radius.md,
    justifyContent: 'center',
    marginLeft: spacing.sm,
    minWidth: 72,
    paddingHorizontal: spacing.md,
  },
  deletePressed: {
    opacity: 0.85,
  },
});
