import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SessionForm } from '@/src/components/SessionForm';
import { useSessions } from '@/src/context/SessionContext';
import { formatCurrency, formatDate, formatHours } from '@/src/lib/format';
import { colors, radius, spacing } from '@/src/theme';

export default function SessionDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { sessions, settings, isLoading, updateSession, deleteSession } =
    useSessions();
  const [editing, setEditing] = useState(false);
  const session = sessions.find((item) => item.id === params.id);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundTitle}>Session not found</Text>
        <Pressable onPress={() => router.replace('/history')}>
          <Text style={styles.link}>Return to history</Text>
        </Pressable>
      </View>
    );
  }

  const confirmDelete = () => {
    Alert.alert(
      'Delete session?',
      'This permanently removes the session from local storage.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSession(session.id);
            router.replace('/history');
          },
        },
      ],
    );
  };

  if (editing) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.screen}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.editHeader}>
            <Text style={styles.heading}>Edit session</Text>
            <Pressable onPress={() => setEditing(false)}>
              <Text style={styles.link}>Cancel</Text>
            </Pressable>
          </View>
          <SessionForm
            currency={settings.currency}
            initialValues={session}
            onSubmit={async (input) => {
              await updateSession(session.id, input);
              setEditing(false);
            }}
            startingBankroll={session.startingBankroll}
            submitLabel="Update session"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.location}>{session.location}</Text>
        <Text style={styles.date}>{formatDate(session.date)}</Text>
        <Text
          style={[
            styles.netResult,
            {
              color:
                session.netResult >= 0 ? colors.positive : colors.negative,
            },
          ]}
        >
          {formatCurrency(session.netResult, settings.currency, true)}
        </Text>
        <Text style={styles.netLabel}>net result</Text>
      </View>

      <View style={styles.card}>
        <DetailRow
          label="Bankroll before session"
          value={formatCurrency(
            session.startingBankroll,
            settings.currency,
          )}
        />
        <DetailRow
          label="Buy-in"
          value={formatCurrency(session.buyIn, settings.currency)}
        />
        <DetailRow
          label="Cash-out"
          value={formatCurrency(session.cashOut, settings.currency)}
        />
        <DetailRow
          label="Hours played"
          value={formatHours(session.hoursPlayed)}
        />
        <DetailRow label="Notes" value={session.notes || 'No notes'} />
      </View>

      <View style={styles.metadata}>
        <Text style={styles.metadataText}>ID: {session.id}</Text>
        <Text style={styles.metadataText}>
          Created: {new Date(session.createdAt).toLocaleString()}
        </Text>
        <Text style={styles.metadataText}>
          Updated: {new Date(session.updatedAt).toLocaleString()}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => setEditing(true)}
          style={({ pressed }) => [
            styles.editButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.editButtonText}>Edit session</Text>
        </Pressable>
        <Pressable
          onPress={confirmDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.deleteButtonText}>Delete session</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  centered: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  notFoundTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  link: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  editHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heading: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  location: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  date: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  netResult: {
    fontSize: 42,
    fontWeight: '800',
    marginTop: spacing.lg,
  },
  netLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  detailRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 23,
  },
  metadata: {
    gap: spacing.xs,
  },
  metadataText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  actions: {
    gap: spacing.sm,
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    minHeight: 50,
    justifyContent: 'center',
  },
  editButtonText: {
    color: colors.background,
    fontWeight: '800',
  },
  deleteButton: {
    alignItems: 'center',
    borderColor: colors.negative,
    borderRadius: radius.sm,
    borderWidth: 1,
    minHeight: 50,
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: colors.negative,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});
