export function calcPercentageChange(
  oldNumber: number,
  newNumber: number
): number {
  return +(((newNumber - oldNumber) / oldNumber) * 100).toFixed(2);
}
