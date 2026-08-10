import { MaterialIcons } from '@expo/vector-icons';
import { PropsWithChildren, useRef } from 'react';
import { Pressable } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { colors } from '@/src/theme';

import { styles } from './SwipeableDeleteRow.styles';

type SwipeableDeleteRowProps = PropsWithChildren<{
  enabled?: boolean;
  /** Receives a close() helper to run after the user confirms. */
  onDelete: (close: () => void) => void;
  accessibilityLabel?: string;
}>;

export function SwipeableDeleteRow({
  children,
  enabled = true,
  onDelete,
  accessibilityLabel = 'Delete',
}: SwipeableDeleteRowProps) {
  const swipeableRef = useRef<Swipeable>(null);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      overshootRight={false}
      renderRightActions={() => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          onPress={() =>
            onDelete(() => {
              swipeableRef.current?.close();
            })
          }
          style={({ pressed }) => [
            styles.deleteAction,
            pressed && styles.deletePressed,
          ]}
        >
          <MaterialIcons name="delete-outline" size={26} color={colors.white} />
        </Pressable>
      )}
    >
      {children}
    </Swipeable>
  );
}
