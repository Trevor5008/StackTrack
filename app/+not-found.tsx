import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/src/theme';

/**
 * Not found screen
 * @returns {JSX.Element}
 * @description This screen is used to display the not found screen.
 * @example
 * <NotFoundScreen />
 */
export default function NotFoundScreen() {
  // return the not found screen
  return (
    // view to handle the container
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      {/* view to handle the container */}
      <View style={styles.container}>
        {/* text to handle the title */}
        <Text style={styles.title}>This screen does not exist.</Text>
        {/* link to handle the link */}

        <Link href="/" style={styles.link}>
          {/* text to handle the link text */}
          <Text style={styles.linkText}>Return to dashboard</Text>
        </Link>
      </View>
    </>
  );
}

// styles for the not found screen
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
