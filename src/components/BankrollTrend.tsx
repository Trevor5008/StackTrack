import { Text, View } from 'react-native';

import { Session } from '@/src/types/session';

import { styles } from './BankrollTrend.styles';

/**
 * Bankroll trend props
 * @returns {JSX.Element}
 * @description This component is used to display the bankroll trend.
 * @example
 * <BankrollTrend sessions={[]} />
 */
type BankrollTrendProps = {
  sessions: Session[];
};

/**
 * Bankroll trend component
 * @returns {JSX.Element}
 * @description This component is used to display the bankroll trend.
 * @example
 * <BankrollTrend sessions={[]} />
 */
export function BankrollTrend({ sessions }: BankrollTrendProps) {
  // reverse the sessions and slice the last 10
  const points = [...sessions].reverse().slice(-10);
  // calculate the max magnitude
  const maxMagnitude = Math.max(
    ...points.map((session) => Math.abs(session.netResult)),
    1,
  );

  return (
    // returns View with style formatting
    <View style={styles.card}>
      <View style={styles.heading}>
        <Text style={styles.title}>Bankroll trend</Text>
        {/* Displays the last 10 sessions */}
        <Text style={styles.caption}>Last {points.length} sessions</Text>
      </View>
      {points.length === 0 ? (
        // returns View with style formatting
        <View style={styles.empty}>
          {/* Displays the empty text */}
          <Text style={styles.empty}>Add a session to start your trend.</Text>
        </View>
      ) : (
        // View w/ style formatting
        <View style={styles.chart}>
          {/* Returns View with style formatting */}
          <View style={styles.axis} />
          {/* Maps through the points */}
          {points.map((session) => {
            // determines if the session is positive or negative
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
