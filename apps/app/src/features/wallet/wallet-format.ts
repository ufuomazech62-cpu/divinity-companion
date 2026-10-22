// upstream-unshipped placeholder utils (P1: real formatting rules).
export function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function formatSignedCents(cents: number): string {
  const value = cents / 100;
  return cents > 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
}

export function describeTransactionType(_type: string): string {
  return "Transaction";
}
