export function normalizePostalCode(v: string) {
  return v.replace(/\s+/g, "").trim();
}

export function isValidPostalCode(v: string) {
  const x = normalizePostalCode(v);
  return /^\d{5}$/.test(x);
}

export function isValideEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
