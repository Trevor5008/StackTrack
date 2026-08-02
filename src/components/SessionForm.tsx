import { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { formatCurrency } from '@/src/lib/format';
import { colors, radius, spacing } from '@/src/theme';
import { SessionInput } from '@/src/types/session';

/**
 * Session form props
 * @returns {SessionFormProps}
 * @description This props are used to pass the session form props.
 * @example
 * <SessionForm initialValues={} startingBankroll={} currency={} submitLabel={} onSubmit={} />
 */
type SessionFormProps = {
  initialValues?: SessionInput;
  startingBankroll: number;
  currency: string;
  submitLabel: string;
  onSubmit: (input: SessionInput) => Promise<void>;
};

/**
 * Form state
 * @returns {FormState}
 * @description This state are used to handle the form state.
 * @example
 * <SessionForm initialValues={} startingBankroll={} currency={} submitLabel={} onSubmit={} />
 */
type FormState = {
  date: string;
  location: string;
  startingBankroll: string;
  buyIn: string;
  cashOut: string;
  hoursPlayed: string;
  notes: string;
};

/**
 * Today
 * @returns {string}
 * @description This function is used to get the today's date.
 * @example
 * <SessionForm initialValues={} startingBankroll={} currency={} submitLabel={} onSubmit={} />
 */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Is valid date
 * @returns {boolean}
 * @description This function is used to check if the date is valid.
 * @example
 * <SessionForm initialValues={} startingBankroll={} currency={} submitLabel={} onSubmit={} />
 */
function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/**
 * Session form
 * @returns {JSX.Element}
 * @description This component is used to display the session form.
 * @example
 * <SessionForm initialValues={} startingBankroll={} currency={} submitLabel={} onSubmit={} />
 */
export function SessionForm({
  initialValues,
  startingBankroll,
  currency,
  submitLabel,
  onSubmit,
}: SessionFormProps) {
  // form to handle the form state
  const [form, setForm] = useState<FormState>({
    date: initialValues?.date ?? today(),
    location: initialValues?.location ?? '',
    startingBankroll: String(
      initialValues?.startingBankroll ?? startingBankroll,
    ),
    buyIn: initialValues ? String(initialValues.buyIn) : '',
    cashOut: initialValues ? String(initialValues.cashOut) : '',
    hoursPlayed: initialValues ? String(initialValues.hoursPlayed) : '',
    notes: initialValues?.notes ?? '',
  });
  // error to handle the error state
  const [error, setError] = useState<string | null>(null);
  // submitting to handle the submitting state
  const [submitting, setSubmitting] = useState(false);

  // net result to handle the net result
  const netResult = useMemo(
    () => (Number(form.cashOut) || 0) - (Number(form.buyIn) || 0),
    [form.buyIn, form.cashOut],
  );

  // set field to handle the set field
  const setField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  // handle submit to handle the handle submit
  const handleSubmit = async () => {
    // numeric fields to handle the numeric fields
    const numericFields = [
      form.startingBankroll,
      form.buyIn,
      form.cashOut,
      form.hoursPlayed,
    ].map(Number);

    // if the date is not valid, set the error
    if (!isValidDate(form.date)) {
      setError('Enter the date as YYYY-MM-DD.');
      return;
    }
    if (!form.location.trim()) {
      setError('Enter a casino or location.');
      return;
    }
    // if the numeric fields are not valid, set the error
    if (
      numericFields.some((value) => !Number.isFinite(value) || value < 0) ||
      numericFields[3] <= 0
    ) {
      setError('Enter valid non-negative amounts and hours greater than zero.');
      return;
    }

    // set the submitting state to true
    setSubmitting(true);
    setError(null);
    try {
      // submit the session
      await onSubmit({
        date: form.date,
        location: form.location.trim(),
        startingBankroll: numericFields[0],
        buyIn: numericFields[1],
        cashOut: numericFields[2],
        hoursPlayed: numericFields[3],
        notes: form.notes.trim() || undefined,
      });
    } catch {
      // if the session could not be saved, set the error
      setError('The session could not be saved. Please try again.');
    } finally {
      // set the submitting state to false
      setSubmitting(false);
    }
  };

  // return the session form
  return (
    // view to handle the form
    <View style={styles.form}>
      {/* field to handle the date field */}
      <Field
        label="Date"
        value={form.date}
        placeholder="YYYY-MM-DD"
        onChangeText={(value) => setField('date', value)}
      />
      {/* field to handle the location field */}
      <Field
        label="Location / casino"
        value={form.location}
        placeholder="Casino name"
        onChangeText={(value) => setField('location', value)}
      />
      {/* field to handle the starting bankroll field */}
      <Field
        label="Bankroll before session"
        value={form.startingBankroll}
        keyboardType="decimal-pad"
        onChangeText={(value) => setField('startingBankroll', value)}
      />
      {/* view to handle the row */}
      <View style={styles.row}>
        {/* view to handle the row field */}
        <View style={styles.rowField}>
          <Field
            label="Buy-in"
            value={form.buyIn}
            placeholder="0"
            keyboardType="decimal-pad"
            onChangeText={(value) => setField('buyIn', value)}
          />
        </View>
        {/* view to handle the row field */}
        <View style={styles.rowField}>
          <Field
            label="Cash-out"
            value={form.cashOut}
            placeholder="0"
            keyboardType="decimal-pad"
            onChangeText={(value) => setField('cashOut', value)}
          />
        </View>
      </View>
      {/* view to handle the result */}
      <View style={styles.result}>
        <Text style={styles.resultLabel}>Net result</Text>
        <Text
          style={[
            styles.resultValue,
            { color: netResult >= 0 ? colors.positive : colors.negative },
          ]}
        >
          {formatCurrency(netResult, currency, true)}
        </Text>
      </View>
      {/* field to handle the hours played field */}
      <Field
        label="Hours played"
        value={form.hoursPlayed}
        placeholder="0"
        keyboardType="decimal-pad"
        onChangeText={(value) => setField('hoursPlayed', value)}
      />
      {/* field to handle the notes field */}
      <Field
        label="Notes (optional)"
        value={form.notes}
        placeholder="Table conditions, takeaways, or reminders"
        multiline
        onChangeText={(value) => setField('notes', value)}
      />
      {/* if the error is not null, display the error */}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {/* pressable to handle the pressable */}
      <Pressable
        accessibilityRole="button"
        disabled={submitting}
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          submitting && styles.buttonDisabled,
        ]}
      >
        <Text style={styles.buttonText}>
          {submitting ? 'Saving…' : submitLabel}
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * Field props
 * @returns {FieldProps}
 * @description This props are used to pass the field props.
 * @example
 * <Field label="Date" value={form.date} placeholder="YYYY-MM-DD" onChangeText={(value) => setField('date', value)} />
 */
type FieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  keyboardType?: 'default' | 'decimal-pad';
  multiline?: boolean;
  onChangeText: (value: string) => void;
};

/**
 * Field
 * @returns {JSX.Element}
 * @description This component is used to display the field.
 * @example
 * <Field label="Date" value={form.date} placeholder="YYYY-MM-DD" onChangeText={(value) => setField('date', value)} />
 */
function Field({
  label,
  value,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  onChangeText,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowField: {
    flex: 1,
  },
  result: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  resultLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  error: {
    color: colors.negative,
    fontSize: 13,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    minHeight: 52,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  buttonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '800',
  },
});
