import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { SwipeableDeleteRow } from '@/src/components/SwipeableDeleteRow';
import { useSessions } from '@/src/context/SessionContext';
import { confirmAction } from '@/src/lib/confirm';
import {
  formatCurrency,
  formatHours,
  formatSessionStart,
} from '@/src/lib/format';
import { colors } from '@/src/theme';
import { Session } from '@/src/types/session';

import { styles } from './SessionListItem.styles';

type SessionListItemProps = {
  session: Session;
  currency: string;
  /** When false, swipe-to-delete is disabled (default true). */
  enableSwipeDelete?: boolean;
  /** Show casino name in meta (History). Hide on casino-scoped lists. */
  showCasinoName?: boolean;
};

export function SessionListItem({
  session,
  currency,
  enableSwipeDelete = true,
  showCasinoName = true,
}: SessionListItemProps) {
  const { deleteSession } = useSessions();
  const isWin = session.netResult >= 0;

  const onDelete = (close: () => void) => {
    confirmAction(
      {
        title: 'Delete session?',
        message: 'This permanently removes the session from local storage.',
        confirmLabel: 'Delete',
        destructive: true,
      },
      async () => {
        close();
        await deleteSession(session.id);
      },
    );
  };

  const metaParts = [
    showCasinoName ? session.location : null,
    formatHours(session.hoursPlayed),
  ].filter(Boolean);

  const card = (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({ pathname: '/session/[id]', params: { id: session.id } })
      }
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.details}>
        <Text style={styles.title}>
          {formatSessionStart(session.date, session.createdAt)}
        </Text>
        <Text style={styles.meta}>{metaParts.join(' · ')}</Text>
      </View>
      <View style={styles.result}>
        <Text
          style={[
            styles.amount,
            { color: isWin ? colors.positive : colors.negative },
          ]}
        >
          {formatCurrency(session.netResult, currency, true)}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );

  return (
    <SwipeableDeleteRow
      enabled={enableSwipeDelete}
      accessibilityLabel="Delete session"
      onDelete={onDelete}
    >
      {card}
    </SwipeableDeleteRow>
  );
}
