import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';
import { Session } from '@/src/types/session';

type BankrollTrendProps = {
  sessions: Session[];
};

export function BankrollTrend({ sessions }: BankrollTrendProps) {
  const points = [...sessions].reverse().slice(-10);
  const maxMagnitude = Math.max(
    ...points.map((session) => Math.abs(session.netResult)),
    1,
  );

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <Text style={styles.title}>Bankroll trend</Text>
        <Text style={styles.caption}>Last {points.length} sessions</Text>
      </View>
      {points.length === 0 ? (
        <Text style={styles.empty}>Add a session to start your trend.</Text>
      ) : (
        <View style={styles.chart}>
          <View style={styles.axis} />
          {points.map((session) => {
            const positive = session.netResult >= 0;
            const height = Math.max(
              4,
              (Math.abs(session.netResult) / maxMagnitude) * 45,
            );
            return (
              <View key={session.id} style={styles.barColumn}>
                <View
                  style={[
                    styles.bar,
                    positive ? styles.positiveBar : styles.negativeBar,
                    positive ? { height } : { height, top: 45 },
                  ]}
                />
              </View>
            );
          })}
        </View>
      )}
      <Text style={styles.todo}>
        Chart-ready preview · TODO: add simulation overlays in a future release.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  heading: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  caption: {
    color: colors.textMuted,
    fontSize: 12,
  },
  chart: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 100,
    marginVertical: spacing.md,
    position: 'relative',
  },
  axis: {
    backgroundColor: colors.border,
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 49,
  },
  barColumn: {
    flex: 1,
    height: 90,
    paddingHorizontal: 3,
    position: 'relative',
  },
  bar: {
    borderRadius: radius.sm,
    left: 3,
    position: 'absolute',
    right: 3,
  },
  positiveBar: {
    backgroundColor: colors.positive,
    bottom: 45,
  },
  negativeBar: {
    backgroundColor: colors.negative,
  },
  empty: {
    color: colors.textMuted,
    paddingVertical: spacing.xl,
    textAlign: 'center',
  },
  todo: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
