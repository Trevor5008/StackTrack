import { AppSettings, Session, SessionInput } from '@/src/types/session';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

// Finite number validator
function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

// Function to check if the value is a non-negative number
function isNonNegativeNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0;
}

// Non-empty string validator
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

// Function to normalize the session
export function normalizeSession(value: Session): Session {
  return {
    ...value,
    location: value.location.trim(),
    notes: value.notes?.trim() ? value.notes.trim() : undefined,
    netResult: value.cashOut - value.buyIn,
  };
}

// Function to check if the value is a session
export function isSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false;
  const session = value as Partial<Session>;

  if (!isNonEmptyString(session.id)) return false;
  if (!isNonEmptyString(session.date) || !isValidDateString(session.date)) {
    return false;
  }
  if (!isNonEmptyString(session.location)) return false;
  if (!isNonNegativeNumber(session.startingBankroll)) return false;
  if (!isNonNegativeNumber(session.buyIn)) return false;
  if (!isNonNegativeNumber(session.cashOut)) return false;
  if (!isFiniteNumber(session.hoursPlayed) || session.hoursPlayed <= 0) {
    return false;
  }
  if (!isFiniteNumber(session.netResult)) return false;
  if (session.notes !== undefined && typeof session.notes !== 'string') {
    return false;
  }
  if (!isNonEmptyString(session.createdAt)) return false;
  if (!isNonEmptyString(session.updatedAt)) return false;

  return true;
}

// Function to check if the value is a app settings
export function isAppSettings(value: unknown): value is AppSettings {
  if (!value || typeof value !== 'object') return false;
  const settings = value as Partial<AppSettings>;
  return (
    isNonNegativeNumber(settings.startingBankroll) &&
    isNonEmptyString(settings.currency)
  );
}

// Function to assert the session input
export function assertSessionInput(input: SessionInput): SessionInput {
  if (!isValidDateString(input.date)) {
    throw new Error('Enter the date as YYYY-MM-DD.');
  }
  if (!input.location.trim()) {
    throw new Error('Enter a casino or location.');
  }
  if (
    !isNonNegativeNumber(input.startingBankroll) ||
    !isNonNegativeNumber(input.buyIn) ||
    !isNonNegativeNumber(input.cashOut) ||
    !isFiniteNumber(input.hoursPlayed) ||
    input.hoursPlayed <= 0
  ) {
    throw new Error(
      'Enter valid non-negative amounts and hours greater than zero.',
    );
  }

  return {
    ...input,
    location: input.location.trim(),
    notes: input.notes?.trim() ? input.notes.trim() : undefined,
  };
}

// Type for the parse sessions result
export type ParseSessionsResult = {
  sessions: Session[];
  warning: string | null;
  migrated: boolean;
};

// Type for the parse settings result
export type ParseSettingsResult = {
  settings: AppSettings;
  migrated: boolean;
  warning: string | null;
};

// Function to extract the session list
function extractSessionList(parsed: unknown): {
  list: unknown[];
  migrated: boolean;
} | null {
  if (Array.isArray(parsed)) {
    return { list: parsed, migrated: true };
  }

  if (
    parsed &&
    typeof parsed === 'object' &&
    'sessions' in parsed &&
    Array.isArray((parsed as { sessions: unknown }).sessions)
  ) {
    const version = (parsed as { version?: unknown }).version;
    return {
      list: (parsed as { sessions: unknown[] }).sessions,
      migrated: version !== 1,
    };
  }

  return null;
}

// Function to parse the sessions payload
export function parseSessionsPayload(raw: string): ParseSessionsResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      sessions: [],
      warning: 'Saved sessions were corrupt and could not be loaded.',
      migrated: false,
    };
  }

  // Extract the session list
  const extracted = extractSessionList(parsed);
  if (!extracted) {
    return {
      sessions: [],
      warning: 'Saved sessions were invalid and could not be loaded.',
      migrated: false,
    };
  }

  // Sessions for the parsed
  const sessions: Session[] = [];
  let dropped = 0;

  for (const item of extracted.list) {
    if (!isSession(item)) {
      dropped += 1;
      continue;
    }
    sessions.push(normalizeSession(item));
  }

  // Warning for the parsed
  const warning =
    dropped > 0
      ? `Skipped ${dropped} invalid session${dropped === 1 ? '' : 's'} from storage.`
      : null;

  // Return the parsed sessions
  return {
    sessions,
    warning,
    migrated: extracted.migrated || dropped > 0,
  };
}

// Function to parse the settings payload
export function parseSettingsPayload(
  raw: string,
  fallback: AppSettings,
): ParseSettingsResult {
  // Parse the settings payload
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Return the fallback settings
    return {
      settings: fallback,
      migrated: false,
      warning: 'Saved settings were corrupt; defaults were restored.',
    };
  }

  // Check if the parsed settings are a app settings
  if (isAppSettings(parsed)) {
    // Return the parsed settings
    return {
      settings: {
        startingBankroll: parsed.startingBankroll,
        currency: parsed.currency.trim().toUpperCase(),
      },
      migrated: true,
      warning: null,
    };
  }

  // Check if the parsed settings are a app settings
  if (
    parsed &&
    typeof parsed === 'object' &&
    'settings' in parsed &&
    isAppSettings((parsed as { settings: unknown }).settings)
  ) {
    // Get the settings
    const settings = (parsed as { settings: AppSettings }).settings;
    const version = (parsed as { version?: unknown }).version;
    // Return the parsed settings
    return {
      settings: {
        startingBankroll: settings.startingBankroll,
        currency: settings.currency.trim().toUpperCase(),
      },
      migrated: version !== 1,
      warning: null,
    };
  }

  // Return the fallback settings
  return {
    settings: fallback,
    migrated: false,
    warning: 'Saved settings were invalid; defaults were restored.',
  };
}
