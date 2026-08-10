import { Pressable, Text, ViewStyle } from 'react-native';

import { styles } from './ActionButton.styles';

type ActionButtonVariant = 'primary' | 'secondary' | 'danger';

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ActionButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
};

export function ActionButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: ActionButtonProps) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        variant === 'secondary' && styles.secondary,
        isDanger && styles.danger,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          isPrimary && styles.primaryLabel,
          variant === 'secondary' && styles.secondaryLabel,
          isDanger && styles.dangerLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
