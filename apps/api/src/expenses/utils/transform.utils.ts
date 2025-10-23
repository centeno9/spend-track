export function fromDecimalToCents(totalDecimal: number) {
  return Math.round(totalDecimal * 100);
}
