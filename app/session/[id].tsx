import { SessionForm } from '@/src/components/SessionForm';
import { SessionTablesList } from '@/src/components/SessionTablesList';
import { useSessions } from '@/src/context/SessionContext';
import { confirmAction } from '@/src/lib/confirm';
import { formatCurrency, formatDate, formatHours } from '@/src/lib/format';
import { loadSessionTables } from '@/src/storage/liveSessionStore';
import { SessionTable } from '@/src/types/liveSession';
import { colors } from '@/src/theme';
import { commonStyles } from '@/src/theme/commonStyles';
import { HeaderBackButton } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { styles } from './[id].styles';

/**
 * Session detail screen
 * @returns {JSX.Element}
 * @description This screen is used to view a session detail.
 * @example
 * <SessionDetailScreen />
 */
export default function SessionDetailScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id: string }>();
  const sessionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { sessions, settings, isLoading, updateSession, deleteSession } =
    useSessions();
  const [editing, setEditing] = useState(false);
  const [tables, setTables] = useState<SessionTable[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const session = sessions.find((item) => item.id === sessionId);

  // Keep header back reliable (native default can go inert on this stack screen).
  useLayoutEffect(() => {
    navigation.setOptions({
      title: editing ? 'Edit session' : 'Session details',
      gestureEnabled: true,
      headerLeft: (props: object) => (
        <HeaderBackButton
          {...props}
          onPress={() => {
            Keyboard.dismiss();
            if (editing) {
              setEditing(false);
              return;
            }
            if (router.canGoBack()) {
              router.back();
              return;
            }
            router.replace('/history');
          }}
        />
      ),
    });
  }, [editing, navigation]);

  // Load the session tables
  useEffect(() => {
    if (!sessionId) {
      setTables([]);
      setTablesLoading(false);
      return;
    }
    setTablesLoading(true);
    loadSessionTables(sessionId)
      .then(setTables)
      .catch(() => setTables([]))
      .finally(() => setTablesLoading(false));
  }, [sessionId]);

  // Render loading indicator
  if (isLoading) {
    return (
      <View style={commonStyles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  // Render not found
  if (!session) {
    return (
      <View style={commonStyles.centered}>
        <Text style={styles.notFoundTitle}>Session not found</Text>
        <Pressable onPress={() => router.replace('/history')}>
          <Text style={commonStyles.link}>Return to history</Text>
        </Pressable>
      </View>
    );
  }

  // Confirm delete session
  const confirmDelete = () => {
    confirmAction(
      {
        title: 'Delete session?',
        message: 'This permanently removes the session from local storage.',
        confirmLabel: 'Delete',
        destructive: true,
      },
      async () => {
        await deleteSession(session.id);
        router.replace('/history');
      },
    );
  };

  // Render edit session
  if (editing) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={commonStyles.screen}
      >
        <ScrollView
          contentContainerStyle={commonStyles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.editHeader}>
            <Text style={styles.heading}>Edit session</Text>
            <Pressable onPress={() => setEditing(false)}>
              <Text style={commonStyles.link}>Cancel</Text>
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
          <SessionTablesList
            cashOut={session.cashOut}
            currency={settings.currency}
            loading={tablesLoading}
            tables={tables}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return ( 
    // keyboard avoiding view to handle the keyboard on mobile devices
    <ScrollView contentContainerStyle={commonStyles.content} style={commonStyles.screen}>
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
          {/* net result */}
          {formatCurrency(session.netResult, settings.currency, true)}
        </Text>
        <Text style={styles.netLabel}>net result</Text>
      </View>

  {/* session details */}
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

      <SessionTablesList
        cashOut={session.cashOut}
        currency={settings.currency}
        loading={tablesLoading}
        tables={tables}
      />

      {/* session metadata */}
      <View style={styles.metadata}>
        <Text style={styles.metadataText}>ID: {session.id}</Text>
        <Text style={styles.metadataText}>
          Created: {new Date(session.createdAt).toLocaleString()}
        </Text>
        <Text style={styles.metadataText}>
          Updated: {new Date(session.updatedAt).toLocaleString()}
        </Text>
      </View>

      {/* session actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => setEditing(true)}
          style={({ pressed }) => [
            styles.editButton,
            pressed && commonStyles.pressed,
          ]}
        >
          <Text style={styles.editButtonText}>Edit session</Text>
        </Pressable>
        <Pressable
          onPress={confirmDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && commonStyles.pressed,
          ]}
        >
          <Text style={styles.deleteButtonText}>Delete session</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

/**
 * Detail row component
 * @param {Object} props - The component props.
 * @param {string} props.label - The label of the detail row.
 * @param {string} props.value - The value of the detail row.
 * @returns {JSX.Element}
 */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}
