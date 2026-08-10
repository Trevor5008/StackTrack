import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

import { styles } from './+not-found.styles';

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
