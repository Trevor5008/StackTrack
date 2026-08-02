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

/**
 * Session detail screen
 * @returns {JSX.Element}
 * @description This screen is used to display the details of a session.
 * @example
 * <SessionDetailScreen />
 */
export default function SessionDetailScreen() {
  // use local search params to get the id from the url
  const params = useLocalSearchParams<{ id: string }>();
  // use sessions context to get the sessions and settings
  const { sessions, settings, isLoading, updateSession, deleteSession } =
    useSessions();
  // use state to manage the editing state
  const [editing, setEditing] = useState(false);
  // find the session with the given id
  const session = sessions.find((item) => item.id === params.id);

  // if the sessions are still loading, return a loading indicator
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  // if the session is not found, return a not found message
  if (!session) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundTitle}>Session not found</Text>
        {/* pressable to handle the return to history */}
        <Pressable onPress={() => router.replace('/history')}>
          <Text style={styles.link}>Return to history</Text>
        </Pressable>
      </View>
    );
  }

  // confirm delete function to handle the confirm delete
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
            // delete the session
            await deleteSession(session.id);
            router.replace('/history');
          },
        },
      ],
    );
  };

  // if the editing state is true, return the edit screen
  if (editing) {
    return (
      <KeyboardAvoidingView
        // behavior to handle the behavior
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.screen}
      >
        <ScrollView
          // content container style to handle the content container style
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* view to handle the edit header */}
          <View style={styles.editHeader}>
            {/* text to handle the edit header */}
            <Text style={styles.heading}>Edit session</Text>
            {/* pressable to handle the cancel */}
            <Pressable onPress={() => setEditing(false)}>
              <Text style={styles.link}>Cancel</Text>
            </Pressable>
          </View>
          {/* session form to handle the session form */}
          <SessionForm
            // currency to handle the currency
            currency={settings.currency}
            // initial values to handle the initial values
            initialValues={session}
            // on submit to handle the on submit
            onSubmit={async (input) => {
              await updateSession(session.id, input);
              setEditing(false);
            }}
            // starting bankroll to handle the starting bankroll
            startingBankroll={session.startingBankroll}
            // submit label to handle the submit label
            submitLabel="Update session"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // return the session detail screen
  return (
    // scroll view to handle the scroll view
    <ScrollView
      // content container style to handle the content container style
      contentContainerStyle={styles.content}
      // style to handle the style
      style={styles.screen}
    >
      {/* view to handle the hero */}
      <View style={styles.hero}>
        {/* text to handle the location */}
        <Text style={styles.location}>{session.location}</Text>
        {/* text to handle the date */}
        <Text style={styles.date}>{formatDate(session.date)}</Text>
        {/* text to handle the net result */}
        <Text
          // style to handle the style
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
        {/* text to handle the net label */}
        <Text style={styles.netLabel}>net result</Text>
      </View>

      {/* view to handle the card */}
      <View style={styles.card}>
        {/* detail row to handle the detail row */}
        <DetailRow
          // label to handle the label
          label="Bankroll before session"
          // value to handle the value
          value={formatCurrency(
            session.startingBankroll,
            settings.currency,
          )}
        />
        <DetailRow
          // label to handle the label
          label="Buy-in"
          // value to handle the value
          value={formatCurrency(session.buyIn, settings.currency)}
        />
        <DetailRow
          // label to handle the label
          label="Cash-out"
          // value to handle the value
          value={formatCurrency(session.cashOut, settings.currency)}
        />
        <DetailRow
          // label to handle the label
          label="Hours played"
          // value to handle the value
          value={formatHours(session.hoursPlayed)}
        />
        {/* detail row to handle the detail row */}
        <DetailRow
          // label to handle the label
          label="Notes"
          // value to handle the value
          value={session.notes || 'No notes'}
        />
      </View>

      {/* view to handle the metadata */}
      <View style={styles.metadata}>
        {/* text to handle the id */}
        <Text style={styles.metadataText}>ID: {session.id}</Text>
        <Text style={styles.metadataText}>
          {/* // text to handle the created */}
          Created: {new Date(session.createdAt).toLocaleString()}
        </Text>
        {/* text to handle the updated */}
        <Text style={styles.metadataText}>
          Updated: {new Date(session.updatedAt).toLocaleString()}
        </Text>
      </View>

      {/* view to handle the actions */}
      <View style={styles.actions}>
        <Pressable
          // on press to handle the on press
          onPress={() => setEditing(true)}
          // style to handle the style
          style={({ pressed }) => [
            styles.editButton,
            pressed && styles.pressed,
          ]}
        >
          {/* text to handle the edit button text */}
          <Text style={styles.editButtonText}>Edit session</Text>
        </Pressable>
        <Pressable
          // on press to handle the on press
          onPress={confirmDelete}
          // style to handle the style
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressed,
          ]}
        >
          {/* text to handle the delete button text */}
          <Text style={styles.deleteButtonText}>Delete session</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

/**
 * Detail row component
 * @param {Object} props - The props for the detail row component.
 * @param {string} props.label - The label for the detail row.
 * @param {string} props.value - The value for the detail row.
 * @returns {JSX.Element}
 * @description This component is used to display a detail row.
 * @example
 * <DetailRow label="Notes" value="No notes" />
 */
function DetailRow({ label, value }: { label: string; value: string }) {
  // return the detail row component
  return (
    // view to handle the detail row
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

/**
 * Styles for the detail row component
 * @returns {StyleSheet}
 * @description This styles are used to style the detail row component.
 * @example
 * <DetailRow label="Notes" value="No notes" />
 */
const styles = StyleSheet.create({
  // screen to handle the screen style
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  // content to handle the content style
  content: {
    // gap to handle the gap
    gap: spacing.lg,
    padding: spacing.md,
    // padding bottom to handle the padding bottom
    paddingBottom: spacing.xl,
  },
  // centered to handle the centered style
  centered: {
    // align items to handle the align items
    alignItems: 'center',
    // background color to handle the background color
    backgroundColor: colors.background,
    // flex to handle the flex
    flex: 1,
    // gap to handle the gap
    gap: spacing.md,
    // justify content to handle the justify content
    justifyContent: 'center',
  },
  notFoundTitle: {
    // color to handle the color
    color: colors.text,
    // font size to handle the font size
    fontSize: 20,
    // font weight to handle the font weight
    fontWeight: '700',
  },
  link: {
    // color to handle the color
    color: colors.primary,
    // font size to handle the font size
    fontSize: 14,
    // font weight to handle the font weight
    fontWeight: '700',
  },
  editHeader: {
    // align items to handle the align items
    alignItems: 'center',
    // flex direction to handle the flex direction
    flexDirection: 'row',
    // justify content to handle the justify content
    justifyContent: 'space-between',
  },
  // heading to handle the heading style
  heading: {
    // color to handle the color
    color: colors.text,
    // font size to handle the font size
    fontSize: 25,
    // font weight to handle the font weight
    fontWeight: '800',
  },
  // hero to handle the hero style
  hero: {
    // align items to handle the align items
    alignItems: 'center',
    // padding vertical to handle the padding vertical
    paddingVertical: spacing.md,
  },
  location: {
    // color to handle the color
    color: colors.text,
    // font size to handle the font size
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
