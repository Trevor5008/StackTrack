import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { formatElapsed } from '@/src/lib/liveTimer';

import { styles } from './ActiveSessionBanner.styles';

type ActiveSessionBannerProps = {
  location: string;
  /** Dashboard shows elapsed; casino omits it. */
  elapsedMs?: number;
  /** When true, eyebrow says session is at this casino. */
  here?: boolean;
  paused?: boolean;
};

export function ActiveSessionBanner({
  location,
  elapsedMs,
  here = false,
  paused = false,
}: ActiveSessionBannerProps) {
  const showTimer = elapsedMs != null;

  return (
    <Pressable
      onPress={() => router.push('/live')}
      style={({ pressed }) => [
        styles.banner,
        showTimer && styles.bannerRow,
        pressed && styles.pressed,
      ]}
    >
      {showTimer ? (
        <>
          <View style={styles.copy}>
            <Text style={styles.eyebrow}>SESSION IN PROGRESS</Text>
            <Text style={styles.timer}>{formatElapsed(elapsedMs)}</Text>
            <Text style={styles.hint}>
              {location}
              {paused ? ' · Paused' : ''} — tap to continue
            </Text>
          </View>
          <Text style={styles.cta}>Open</Text>
        </>
      ) : (
        <>
          <Text style={styles.eyebrow}>
            {here ? 'SESSION IN PROGRESS HERE' : 'SESSION IN PROGRESS'}
          </Text>
          <Text style={styles.hint}>
            {here
              ? 'Tap to continue this casino’s live session'
              : `Active at ${location} — tap to open`}
          </Text>
        </>
      )}
    </Pressable>
  );
}
