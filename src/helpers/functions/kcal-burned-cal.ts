const INTENSITY_MULTIPLIERS: Record<number, number> = {
  1: 0.85,
  2: 0.93,
  3: 1.0,
  4: 1.08,
  5: 1.15,
};

export function calcKcal(
  durationMinutes: number,
  metValue: number,
  userWeightKg: number,
  intensityLevel: number = 3,
  ahr?: number,
  rhr?: number,
  userAge: number = 25,
): number {
  if (!durationMinutes || durationMinutes <= 0) return 0;
  if (!metValue || metValue <= 0) return 0;
  if (!userWeightKg || userWeightKg <= 0) return 0;

  // if heart rate data available, use Karvonen formula for better accuracy
  if (ahr && rhr && ahr > rhr && rhr > 30 && rhr < 100 && ahr < 210) {
    const HRmax = 208 - 0.7 * userAge;
    const pctHRR = Math.max(0, Math.min(1, (ahr - rhr) / Math.max(1, HRmax - rhr)));

    const VO2rest = 3.5; // ml/kg/min
    const VO2maxGuess = 40.0; // ml/kg/min
    const VO2 = VO2rest + pctHRR * (VO2maxGuess - VO2rest);

    const litersO2 = (VO2 * userWeightKg * durationMinutes) / 1000;
    const kcal = litersO2 * 5;
    return Math.round(kcal * 10) / 10;
  }

  // fallback to MET-based calculation
  const clampedIntensity = Math.max(1, Math.min(5, Math.round(intensityLevel)));
  const multiplier = INTENSITY_MULTIPLIERS[clampedIntensity] || 1.0;

  const hours = durationMinutes / 60;
  const kcal = metValue * multiplier * userWeightKg * hours;

  return Math.round(kcal * 10) / 10;
}
