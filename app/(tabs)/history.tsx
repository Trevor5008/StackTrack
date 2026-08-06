import { FlatList, StyleSheet, Text, View } from 'react-native';

import { SessionListItem } from '@/src/components/SessionListItem';
import { useSessions } from '@/src/context/SessionContext';
import { colors, spacing } from '@/src/theme';

/**
 * History screen
 * @returns {JSX.Element}
 * @description This screen is used to display the history of sessions.
 * @example
 * <HistoryScreen />
 */
export default function HistoryScreen() {
  const { sessions, settings } = useSessions();

  // return the history screen
  return (
    // flat list to handle the list of sessions
    <FlatList
      // list empty component to handle the empty state
      ListEmptyComponent={
        // view to handle the empty state
        <View style={styles.empty}>
          {/* text to handle the empty title */}
          <Text style={styles.emptyTitle}>No sessions yet</Text>
          {/* text to handle the empty text */}
          <Text style={styles.emptyText}>
            Use Add Session to start tracking, or load demo data from Settings.
          </Text>
        </View>}
      // content container style to handle the content container style
      contentContainerStyle={
        // array to handle the content container style
        [
          // styles to handle the content container style
          styles.content,
          // if there are no sessions, add the empty content style
          sessions.length === 0 && styles.emptyContent,
        ]
      }
      // data to handle the data
      data={sessions}
      // item separator component to handle the item separator component
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      keyExtractor={(session) => session.id}
      renderItem={({ item }) => (
        <SessionListItem currency={settings.currency} session={item} />
      )}
      showsVerticalScrollIndicator={false}
      style={styles.screen}
    />
  );
}

/**
 * Styles for the history screen
 * @returns {StyleSheet}
 * @description This styles are used to style the history screen.
 * @example
 * <HistoryScreen />
 */
const styles = StyleSheet.create({
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
