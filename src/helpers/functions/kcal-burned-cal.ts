import { ActivityRecord } from 'src/activity_records/entities/activity_record.entity';
import { Activity } from 'src/activities/entities/activity.entity';

// Nếu enum ActivityType của bạn có giá trị cụ thể (e.g. 'CARDIO','RUN','WALK','STRENGTH',...)
// thì chỉnh lại các chuỗi dưới cho khớp (hoặc dùng chính enum).

type Cfg = {
  baseSecondsPerRep?: number; // default 3.5
  // scale MET theo intensity_level (1..5)
  metIntensityScale?: Record<1 | 2 | 3 | 4 | 5, number>;
  // scale seconds/rep theo intensity_level (1..5) (intensity cao => rep nhanh hơn)
  secondsPerRepScale?: Record<1 | 2 | 3 | 4 | 5, number>;
  // map seconds/rep theo category (nếu activity.categories có)
  categorySecondsPerRep?: Record<string, number>;
  // fallback tuổi khi không có birth_date
  defaultAge?: number;
};

const DEFAULT_CFG: Required<Cfg> = {
  baseSecondsPerRep: 3.5,
  metIntensityScale: { 1: 0.85, 2: 0.93, 3: 1.0, 4: 1.08, 5: 1.15 },
  secondsPerRepScale: { 1: 1.15, 2: 1.07, 3: 1.0, 4: 0.93, 5: 0.85 },
  // tuỳ nghi: chỉnh key cho khớp ActivityType của bạn
  categorySecondsPerRep: {
    STRENGTH: 4.0,
    CALISTHENICS: 3.0,
    YOGA: 5.0,
    PILATES: 5.0,
    HIIT: 2.5,
    CROSSFIT: 2.5,
    RUN: 0, // 0 nghĩa là “không dùng reps-mode cho loại này”
    WALK: 0,
    CYCLE: 0,
    CARDIO: 0,
  },
  defaultAge: 25,
};

// ===== Public API =====
export function calcKcalSimple(
  ar: ActivityRecord,
  activity: Activity,
  optsPartial?: Partial<Cfg>,
): { kcal: number; method: 'HR' | 'HOUR' | 'REPS' | 'NONE'; notes?: string } {
  const cfg = { ...DEFAULT_CFG, ...optsPartial };

  const weight = ar.user_weight_kg;
  if (!weight || weight <= 0) return { kcal: 0, method: 'NONE', notes: 'missing user_weight_kg' };

  // ── HOUR mode (hours hiện diện)
  if (isPositive(ar.hours)) {
    // (optional) Ưu tiên HR-lite nếu ahr/rhr dùng được
    const kcalHR = tryKcalFromHRLite(ar, weight, cfg.defaultAge);
    if (kcalHR > 0) {
      return { kcal: round1(kcalHR), method: 'HR', notes: 'HR-lite' };
    }
    // fallback MET
    const met = deriveMetWithIntensity(activity.met_value, ar.intensity_level);
    const kcal = met * weight * ar.hours!;
    return { kcal: round1(kcal), method: 'HOUR' };
  }

  // ── REPS mode (reps hiện diện)
  if (isPositive(ar.reps)) {
    const secPerRep = deriveSecondsPerRep(activity, ar.intensity_level, cfg);
    if (secPerRep <= 0) {
      // nếu category thuộc cardio (RUN/WALK/…): không dùng reps-mode
      return { kcal: 0, method: 'NONE', notes: 'reps-mode not suitable for this activity' };
    }
    const minutes = (ar.reps! * secPerRep) / 60;
    const hours = minutes / 60;
    const met = deriveMetWithIntensity(activity.met_value, ar.intensity_level);
    const kcal = met * weight * hours;
    return { kcal: round1(kcal), method: 'REPS', notes: `secPerRep=${secPerRep}` };
  }

  return { kcal: 0, method: 'NONE', notes: 'neither hours nor reps present' };
}

// ===== Helpers =====
function isPositive(n?: number | null): n is number {
  return typeof n === 'number' && n > 0;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function clampInt(n: number, min: number, max: number) {
  return Math.trunc(clamp(n, min, max));
}
function round1(n: number) {
  return Math.round(n * 10) / 10;
}

// MET × intensity scale
function deriveMetWithIntensity(baseMet: number, intensity?: number | null): number {
  const lvl = clampInt(intensity ?? 3, 1, 5) as 1 | 2 | 3 | 4 | 5;
  const scaleMap = DEFAULT_CFG.metIntensityScale;
  // nếu có optsPartial sẽ bị override ở trên rồi; để gọn, lấy trực tiếp từ DEFAULT_CFG (đã merge)
  const scale = (scaleMap as any)[lvl] ?? 1.0;
  return clamp(baseMet * scale, 1.0, 20.0);
}

// Seconds/rep theo category + intensity
function deriveSecondsPerRep(
  activity: Activity,
  intensity?: number | null,
  cfg: Required<Cfg> = DEFAULT_CFG,
): number {
  const lvl = clampInt(intensity ?? 3, 1, 5) as 1 | 2 | 3 | 4 | 5;

  // Ưu tiên map theo categories (nếu có)
  let base = cfg.baseSecondsPerRep;
  if (Array.isArray(activity.categories) && activity.categories.length) {
    // lấy min trong các category seconds/rep > 0 (để ưu tiên cường độ nhanh nhất nếu nhiều nhãn)
    let found = Infinity;
    for (const c of activity.categories) {
      const v = cfg.categorySecondsPerRep[c as keyof typeof cfg.categorySecondsPerRep];
      if (typeof v === 'number' && v > 0) found = Math.min(found, v);
      if (v === 0) found = 0; // marker: không dùng reps-mode cho cardio (RUN/WALK/CYCLE...)
    }
    if (found !== Infinity) base = found;
  }

  if (base === 0) return 0; // không dùng reps-mode cho loại này

  const scaled = base * ((DEFAULT_CFG.secondsPerRepScale as any)[lvl] ?? 1.0);
  return clamp(scaled, 1.5, 8.0);
}

// HR-lite (Karvonen). Dùng **chỉ khi có hours + ahr + rhr**; age nếu không có → defaultAge
function tryKcalFromHRLite(ar: ActivityRecord, weightKg: number, defaultAge = 25): number {
  if (!isPositive(ar.hours)) return 0;
  if (!isPositive(ar.ahr) || !isPositive(ar.rhr)) return 0;

  const ahr = ar.ahr!,
    rhr = ar.rhr!;
  // sanity basic
  if (!(rhr > 30 && rhr < 100)) return 0;
  if (!(ahr > rhr && ahr < 210)) return 0;

  // cố gắng lấy tuổi từ ar.user?.birth_date nếu có (chỉ khi bạn load relation user)
  // ở đây để đơn giản, dùng defaultAge
  const age = defaultAge;
  const HRmax = 208 - 0.7 * age;
  const pctHRR = clamp((ahr - rhr) / Math.max(1, HRmax - rhr), 0, 1);

  const VO2rest = 3.5; // ml/kg/min
  const VO2maxGuess = 40.0; // ml/kg/min (≈ 11.4 MET) – đơn giản hoá
  const VO2 = VO2rest + pctHRR * (VO2maxGuess - VO2rest);

  const minutes = ar.hours! * 60;
  const litersO2 = (VO2 * weightKg * minutes) / 1000;
  return litersO2 * 5; // kcal
}
