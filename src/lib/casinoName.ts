/** Case-insensitive uniqueness key for casino names. */
export function casinoNameKey(name: string): string {
  return name.trim().toLowerCase();
}
