import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';
import { Session } from '@/src/types/session';

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

/**
 * Styles for the bankroll trend component
 * @returns {StyleSheet}
 * @description This styles are used to style the bankroll trend component.
 * @example
 * <BankrollTrend sessions={[]} />
 */
const styles = StyleSheet.create({
  // card to handle the card style
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  // heading to handle the heading style
  heading: {
    // align items to handle the align items
    alignItems: 'baseline',
    // flex direction to handle the flex direction
    flexDirection: 'row',
    // justify content to handle the justify content
    justifyContent: 'space-between',
  },
  // title to handle the title style
  title: {
    // color to handle the color
    color: colors.text,
    // font size to handle the font size
    fontSize: 17,
    // font weight to handle the font weight
    fontWeight: '700',
  },
  // caption to handle the caption style
  caption: {
    // color to handle the color
    color: colors.textMuted,
    // font size to handle the font size
    fontSize: 12,
  },
  chart: {
    // align items to handle the align items
    alignItems: 'center',
    // flex direction to handle the flex direction
    flexDirection: 'row',
    // height to handle the height
    height: 100,
    // margin vertical to handle the margin vertical
    marginVertical: spacing.md,
    // position to handle the position
    position: 'relative',
  },
  axis: {
    // background color to handle the background color
    backgroundColor: colors.border,
    // height to handle the height
    height: 1,
    // left to handle the left
    left: 0,
    // position to handle the position
    position: 'absolute',
    // right to handle the right
    right: 0,
    // top to handle the top
    top: 49,
  },
  barColumn: {
    // flex to handle the flex
    flex: 1,
    // height to handle the height
    height: 90,
    // padding horizontal to handle the padding horizontal
    paddingHorizontal: 3,
    // position to handle the position
    position: 'relative',
  },
  bar: {
    // border radius to handle the border radius
    borderRadius: radius.sm,
    // left to handle the left
    left: 3,
    // position to handle the position
    position: 'absolute',
    // right to handle the right
    right: 3,
  },
  positiveBar: {
    // background color to handle the background color
    backgroundColor: colors.positive,
    // bottom to handle the bottom
    bottom: 45,
  },
  negativeBar: {
    // background color to handle the background color
    backgroundColor: colors.negative,
  },
  empty: {
    // color to handle the color
    color: colors.textMuted,
    // padding vertical to handle the padding vertical
    paddingVertical: spacing.xl,
    // text align to handle the text align
    textAlign: 'center',
  },
  todo: {
    // color to handle the color
    color: colors.textMuted,
    // font size to handle the font size
    fontSize: 11,
  },
});
