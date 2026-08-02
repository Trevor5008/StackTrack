import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatCurrency, formatDate, formatHours } from '@/src/lib/format';
import { colors, radius, spacing } from '@/src/theme';
import { Session } from '@/src/types/session';

/**
 * Session list item props
 * @returns {SessionListItemProps}
 * @description This props are used to pass the session list item props.
 * @example
 * <SessionListItem session={} currency={} />
 */
type SessionListItemProps = {
  session: Session;
  currency: string;
};

/**
 * Session list item
 * @returns {JSX.Element}
 * @description This component is used to display the session list item.
 * @example
 * <SessionListItem session={} currency={} />
 */
export function SessionListItem({
  session,
  currency,
}: SessionListItemProps) {
  // is win to handle the is win state
  const isWin = session.netResult >= 0;

  return (
    // pressable to handle the pressable
    <Pressable
      // accessibility role to handle the accessibility role
      accessibilityRole="button"
      // on press to handle the on press
      onPress={() =>
        // push the session id to the session id
        router.push({ pathname: '/session/[id]', params: { id: session.id } })
      }
      // style to handle the style
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {/* view to handle the details */}
      <View style={styles.details}>
        <Text style={styles.location}>{session.location}</Text>
        {/* text to handle the meta */}
        <Text style={styles.meta}>
          {formatDate(session.date)} · {formatHours(session.hoursPlayed)}
        </Text>
      </View>
      {/* view to handle the result */}
      <View style={styles.result}>
        <Text
          // style to handle the style
          style={[
            styles.amount,
            { color: isWin ? colors.positive : colors.negative },
          ]}
        >
          {/* format the currency */}
          {formatCurrency(session.netResult, currency, true)}
        </Text>
        {/* text to handle the chevron */}
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

/**
 * Styles for the session list item component
 * @returns {StyleSheet}
 * @description This styles are used to style the session list item component.
 * @example
 * <SessionListItem session={} currency={} />
 */
const styles = StyleSheet.create({
  // row to handle the row style
  row: {
    // align items to handle the align items
    alignItems: 'center',
    // background color to handle the background color
    backgroundColor: colors.surface,
    // border color to handle the border color
    borderColor: colors.border,
    // border radius to handle the border radius
    borderRadius: radius.md,
    // border width to handle the border width
    borderWidth: 1,
    // flex direction to handle the flex direction
    flexDirection: 'row',
    padding: spacing.md,
  },
  pressed: {
    // background color to handle the background color
    backgroundColor: colors.surfaceElevated,
    // opacity to handle the opacity
    opacity: 0.85,
  },
  details: {
    // flex to handle the flex
    flex: 1,
    // margin right to handle the margin right
    marginRight: spacing.md,
  },
  location: {
    // color to handle the color
    color: colors.text,
    // font size to handle the font size
    fontSize: 16,
    // font weight to handle the font weight
    fontWeight: '700',
    // margin bottom to handle the margin bottom
    marginBottom: spacing.xs,
  },
  meta: {
    // color to handle the color
    color: colors.textMuted,
    // font size to handle the font size
    fontSize: 13,
  },
  result: {
    // align items to handle the align items
    alignItems: 'center',
    // flex direction to handle the flex direction
    flexDirection: 'row',
    gap: spacing.sm,
  },
  amount: {
    fontSize: 17,
    fontWeight: '700',
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 25,
  },
});
