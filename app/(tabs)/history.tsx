import { FlatList, StyleSheet, Text, View } from 'react-native';

import { SessionListItem } from '@/src/components/SessionListItem';
import { useSessions } from '@/src/context/SessionContext';
import { colors, spacing } from '@/src/theme';

export default function HistoryScreen() {
  const { sessions, settings } = useSessions();

  return (
    <FlatList
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No sessions yet</Text>
          <Text style={styles.emptyText}>
            Use Add Session to start tracking your play.
          </Text>
        </View>
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.heading}>Session history</Text>
          <Text style={styles.subtitle}>
            {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} ·
            newest first
          </Text>
        </View>
      }
      contentContainerStyle={[
        styles.content,
        sessions.length === 0 && styles.emptyContent,
      ]}
      data={sessions}
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

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContent: {
    flexGrow: 1,
  },
  header: {
    marginBottom: spacing.lg,
  },
  heading: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  separator: {
    height: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
  },
});
