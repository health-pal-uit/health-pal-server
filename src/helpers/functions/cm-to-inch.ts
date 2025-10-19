export function cmToInch(cm: number): number {
  const inch = cm / 2.54;
  return +inch.toFixed(2);
}
