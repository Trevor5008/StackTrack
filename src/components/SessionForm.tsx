import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { TextField } from '@/src/components/TextField';
import { useSessions } from '@/src/context/SessionContext';
import { formatCurrency } from '@/src/lib/format';
import { ensureCasino } from '@/src/storage/casinoStore';
import { colors } from '@/src/theme';
import { SessionInput } from '@/src/types/session';

import { styles } from './SessionForm.styles';

type SessionFormProps = {
  initialValues?: SessionInput;
  startingBankroll: number;
  currency: string;
  submitLabel: string;
  onSubmit: (input: SessionInput) => Promise<void>;
};

type FormState = {
  date: string;
  casinoId: string;
  startingBankroll: string;
  buyIn: string;
  cashOut: string;
  hoursPlayed: string;
  notes: string;
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function SessionForm({
  initialValues,
  startingBankroll,
  currency,
  submitLabel,
  onSubmit,
}: SessionFormProps) {
  const { casinos, refreshCasinos } = useSessions();
  const [form, setForm] = useState<FormState>({
    date: initialValues?.date ?? today(),
    casinoId: initialValues?.casinoId ?? '',
    startingBankroll: String(
      initialValues?.startingBankroll ?? startingBankroll,
    ),
    buyIn: initialValues ? String(initialValues.buyIn) : '',
    cashOut: initialValues ? String(initialValues.cashOut) : '',
    hoursPlayed: initialValues ? String(initialValues.hoursPlayed) : '',
    notes: initialValues?.notes ?? '',
  });
  const [newCasinoName, setNewCasinoName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const netResult = useMemo(
    () => (Number(form.cashOut) || 0) - (Number(form.buyIn) || 0),
    [form.buyIn, form.cashOut],
  );

  const setField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  /**
   * Handle the submission of the session form.
   * @returns {Promise<void>}
   * @description This function is used to handle the submission of the session form.
   * @example
   * <SessionForm onSubmit={handleSubmit} />
   */
  const handleSubmit = async () => {
    const numericFields = [
      form.startingBankroll,
      form.buyIn,
      form.cashOut,
      form.hoursPlayed,
    ].map(Number);

    if (!isValidDate(form.date)) {
      setError('Enter the date as YYYY-MM-DD.');
      return;
    }

    // Validate the casino ID and location.
    let casinoId = form.casinoId.trim();
    let location = casinos.find((c) => c.id === casinoId)?.name ?? '';

    if (!casinoId && newCasinoName.trim()) {
      try {
        const casino = await ensureCasino(newCasinoName);
        await refreshCasinos();
        casinoId = casino.id;
        location = casino.name;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Could not create casino.',
        );
        return;
      }
    }

    if (!casinoId || !location) {
      setError('Select a casino or enter a new casino name.');
      return;
    }

    if (
      numericFields.some((value) => !Number.isFinite(value) || value < 0) ||
      numericFields[3] <= 0
    ) {
      setError('Enter valid non-negative amounts and hours greater than zero.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        date: form.date,
        casinoId,
        location,
        startingBankroll: numericFields[0],
        buyIn: numericFields[1],
        cashOut: numericFields[2],
        hoursPlayed: numericFields[3],
        notes: form.notes.trim() || undefined,
      });
    } catch {
      setError('The session could not be saved. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    //
    // Render the session form.
    // @returns {JSX.Element}
    // @description This function is used to render the session form.
    // @example
    // <SessionForm onSubmit={handleSubmit} />
    //
    <View style={styles.form}>
      <TextField
        label="Date"
        value={form.date}
        placeholder="YYYY-MM-DD"
        onChangeText={(value) => setField('date', value)}
      />

      <Text style={styles.label}>Casino</Text>
      <View style={styles.chipRow}>
        {casinos.map((casino) => {
          const selected = form.casinoId === casino.id;
          return (
            <Pressable
              key={casino.id}
              onPress={() => {
                setField('casinoId', casino.id);
                setNewCasinoName('');
              }}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text
                style={[styles.chipText, selected && styles.chipTextSelected]}
              >
                {casino.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <TextField
        label="Or new casino"
        value={newCasinoName}
        placeholder="Type a new casino name"
        onChangeText={(value) => {
          setNewCasinoName(value);
          if (value.trim()) setField('casinoId', '');
        }}
      />

      {/* Bankroll session field */}
      <TextField
        label="Bankroll before session"
        value={form.startingBankroll}
        keyboardType="decimal-pad"
        onChangeText={(value) => setField('startingBankroll', value)}
      />
      <View style={styles.row}>
        <View style={styles.rowField}>
          <TextField
            label="Buy-in"
            value={form.buyIn}
            placeholder="0"
            keyboardType="decimal-pad"
            onChangeText={(value) => setField('buyIn', value)}
          />
        </View>
        <View style={styles.rowField}>
          <TextField
            label="Cash-out"
            value={form.cashOut}
            placeholder="0"
            keyboardType="decimal-pad"
            onChangeText={(value) => setField('cashOut', value)}
          />
        </View>
      </View>
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
      <TextField
        label="Hours played"
        value={form.hoursPlayed}
        placeholder="0"
        keyboardType="decimal-pad"
        onChangeText={(value) => setField('hoursPlayed', value)}
      />
      <TextField
        label="Notes"
        value={form.notes}
        placeholder="Optional"
        multiline
        onChangeText={(value) => setField('notes', value)}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        onPress={() => void handleSubmit()}
        disabled={submitting}
        style={({ pressed }) => [
          styles.submit,
          pressed && styles.pressed,
          submitting && styles.disabled,
        ]}
      >
        <Text style={styles.submitText}>
          {submitting ? 'Saving…' : submitLabel}
        </Text>
      </Pressable>
    </View>
  );
}
