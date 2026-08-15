import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ActionButton } from '@/src/components/ActionButton';
import { TextField } from '@/src/components/TextField';
import {
  BlackjackPayout,
  Dealer17,
  DEALER17_OPTIONS,
  DECK_OPTIONS,
  DeckCount,
  PAYOUT_OPTIONS,
  TableRules,
} from '@/src/types/tableRules';

// Import styles for the form
import { styles } from './TableRulesForm.styles';

// Define the props for the form
type TableRulesFormProps = {
  initialRules: TableRules;
  onCancel: () => void;
  onSave: (rules: TableRules) => void | Promise<void>;
  saving?: boolean;
};

// Define the choice row component
function ChoiceRow<T extends string | number>({
  label,
  options,
  value,
  onChange,
  formatLabel,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  formatLabel?: (option: T) => string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={String(option)}
              onPress={() => onChange(option)}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[styles.chipText, selected && styles.chipTextSelected]}
              >
                {formatLabel ? formatLabel(option) : String(option)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function YesNoRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <ChoiceRow
      label={label}
      options={['Yes', 'No'] as const}
      value={value ? 'Yes' : 'No'}
      onChange={(next) => onChange(next === 'Yes')}
    />
  );
}

export function TableRulesForm({
  initialRules,
  onCancel,
  onSave,
  saving = false,
}: TableRulesFormProps) {
  // Local draft only — parent remounts via key when opening the sheet.
  // Do not sync from initialRules on every render (timer ticks recreate the object).
  const [rules, setRules] = useState<TableRules>(initialRules);

  return (
    <View style={styles.form}>
      <Text style={styles.title}>Table rules</Text>

      <TextField
        label="Table minimum"
        value={String(rules.minimumBet)}
        keyboardType="decimal-pad"
        placeholder="25"
        onChangeText={(value) => {
          const parsed = Number(value);
          if (value.trim() === '') {
            setRules((prev) => ({ ...prev, minimumBet: 0 }));
            return;
          }
          if (Number.isFinite(parsed) && parsed >= 0) {
            setRules((prev) => ({ ...prev, minimumBet: parsed }));
          }
        }}
      />

      <ChoiceRow<DeckCount>
        label="Decks"
        options={DECK_OPTIONS}
        value={rules.decks}
        onChange={(decks) => setRules((prev) => ({ ...prev, decks }))}
      />

      <ChoiceRow<BlackjackPayout>
        label="Blackjack payout"
        options={PAYOUT_OPTIONS}
        value={rules.blackjackPayout}
        onChange={(blackjackPayout) =>
          setRules((prev) => ({ ...prev, blackjackPayout }))
        }
      />

      <ChoiceRow<Dealer17>
        label="Dealer on soft 17"
        options={DEALER17_OPTIONS}
        value={rules.dealer17}
        onChange={(dealer17) => setRules((prev) => ({ ...prev, dealer17 }))}
        formatLabel={(option) =>
          option === 'S17' ? 'Stands (S17)' : 'Hits (H17)'
        }
      />

      <YesNoRow
        label="Double after split"
        value={rules.doubleAfterSplit}
        onChange={(doubleAfterSplit) =>
          setRules((prev) => ({ ...prev, doubleAfterSplit }))
        }
      />

      <YesNoRow
        label="Late surrender"
        value={rules.lateSurrender}
        onChange={(lateSurrender) =>
          setRules((prev) => ({ ...prev, lateSurrender }))
        }
      />

      <View style={styles.actions}>
        <ActionButton
          label="Cancel"
          onPress={onCancel}
          variant="secondary"
          disabled={saving}
        />
        <ActionButton
          label={saving ? 'Saving…' : 'Save rules'}
          onPress={() => void onSave(rules)}
          disabled={saving}
        />
      </View>
    </View>
  );
}
