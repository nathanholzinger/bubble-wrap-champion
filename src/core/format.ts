const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];
const SCI_THRESHOLD = 1_000n ** 11n; // 10^33 — one tier past No

export function formatBigInt(n: bigint): string {
  if (n < 1_000n) return String(n);

  // Scientific notation for values >= 10^33
  if (n >= SCI_THRESHOLD) {
    const s = n.toString();
    return `${s[0]}.${s[1]}${s[2]}${s[3]}e${s.length - 1}`;
  }

  // Find which suffix tier this value belongs to
  let val = n;
  let idx = 0;
  while (val >= 1_000n && idx < SUFFIXES.length - 1) {
    val = val / 1_000n;
    idx++;
  }

  // Compute three decimal places entirely in bigint — no Number() conversion
  const divisor = 1_000n ** BigInt(idx);
  const whole   = n / divisor;
  const frac    = (n % divisor) / (divisor / 1000n);
  return `${whole}.${frac} ${SUFFIXES[idx]}`;
}
