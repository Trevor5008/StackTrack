import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';
import {
  BlackjackPayout,
  Dealer17,
  DEALER17_OPTIONS,
  DECK_OPTIONS,
  DeckCount,
  PAYOUT_OPTIONS,
  TableRules,
} from '@/src/types/tableRules';

type TableRulesFormProps = {
  initialRules: TableRules;
  onCancel: () => void;
  onSave: (rules: TableRules) => void | Promise<void>;
  saving?: boolean;
};

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
        <Pressable
          onPress={onCancel}
          disabled={saving}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={() => void onSave(rules)}
          disabled={saving}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
            saving && styles.disabled,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {saving ? 'Saving…' : 'Save rules'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  field: {
    gap: spacing.sm,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.background,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  primaryButtonText: {
    color: colors.background,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
});
