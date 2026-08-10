import { MaterialIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { colors } from '@/src/theme';

import { styles } from './TextField.styles';

type TextFieldProps = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: TextInputProps['keyboardType'];
  multiline?: boolean;
  autoFocus?: boolean;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  /** Extra style for the outer field wrapper. */
  style?: object;
};

/**
 * Text input with a trailing × that dismisses the keyboard (and blurs the field).
 */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  autoFocus,
  returnKeyType,
  onSubmitEditing,
  style,
}: TextFieldProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const dismiss = () => {
    inputRef.current?.blur();
    Keyboard.dismiss();
  };

  return (
    <View style={[styles.field, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, multiline && styles.inputRowMultiline]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, multiline && styles.multiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          multiline={multiline}
          autoFocus={autoFocus}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {focused ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss keyboard"
            hitSlop={8}
            onPress={dismiss}
            style={({ pressed }) => [
              styles.dismissButton,
              multiline && styles.dismissButtonMultiline,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons name="close" size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
