/**
 * Format currency
 * @param {number} value
 * @param {string} currency
 * @param {boolean} showSign
 * @returns {string}
 * @description This function is used to format the currency.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */ 
export function formatCurrency(value: number, currency: string, showSign = false): string {
  // formatted to handle the formatted state
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Math.abs(value));

  // if the show sign is false or the value is 0, return the formatted value
  if (!showSign || value === 0) return value < 0 ? `-${formatted}` : formatted;
  return `${value > 0 ? '+' : '-'}${formatted}`;
}

/**
 * Format date
 * @param {string} date
 * @returns {string}
 * @description This function is used to format the date.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export function formatDate(date: string): string {
  // return the formatted date
  return new Intl.DateTimeFormat('en-US', {
    // month to handle the month
    month: 'short',
    // day to handle the day
    day: 'numeric',
    // year to handle the year
    year: 'numeric',
    // time zone to handle the time zone
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

/**
 * Format hours
 * @param {number} hours
 * @returns {string}
 * @description This function is used to format the hours.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export function formatHours(hours: number): string {
  // return the formatted hours
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hr`; // eslint-disable-line no-nested-ternary
}

/**
 * Session list title: calendar date plus local time from createdAt.
 */
export function formatSessionStart(date: string, createdAt: string): string {
  const datePart = formatDate(date);
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return datePart;
  const timePart = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(created);
  return `${datePart} · ${timePart}`;
}

/**
 * Table card primary title from minimum bet when rules exist.
 */
export function formatTableCardTitle(
  rules: { minimumBet: number } | null,
  currency: string,
  name: string,
): { title: string; subtitle: string | null } {
  const trimmed = name.trim();
  if (rules) {
    return {
      title: `${formatCurrency(rules.minimumBet, currency)} min`,
      subtitle: trimmed || null,
    };
  }
  return { title: trimmed || 'Table', subtitle: null };
}
