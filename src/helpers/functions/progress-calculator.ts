import { ActivityRecord } from 'src/activity_records/entities/activity_record.entity';

// ---- Helper: tạo bộ cộng dồn & tính % theo template ----
export function makeProgressAccumulator(template: ActivityRecord) {
  type MetricKey = 'reps' | 'hours' | 'distance_km' | 'kcal_burned' | 'load_kg';

  // 1) Lấy các chỉ số mà template có yêu cầu (target > 0)
  const metrics: MetricKey[] = ['reps', 'hours', 'distance_km', 'kcal_burned', 'load_kg'];
  const targets: Partial<Record<MetricKey, number>> = {};
  for (const m of metrics) {
    const v = (template as any)[m];
    if (typeof v === 'number' && isFinite(v) && v > 0) {
      targets[m] = v;
    }
  }
  const targetKeys = Object.keys(targets) as MetricKey[];
  if (targetKeys.length === 0) {
    // Không có chỉ số nào được yêu cầu → coi như 0%
    return {
      add: (_ar: ActivityRecord) => {},
      percent: () => 0,
    };
  }

  // 2) Khởi tạo tổng của user cho từng metric
  const sums: Partial<Record<MetricKey, number>> = {};
  for (const k of targetKeys) sums[k] = 0;

  // 3) API cộng dồn từng AR của user (chỉ cộng metric có giá trị)
  function add(ar: ActivityRecord) {
    for (const k of targetKeys) {
      const val = (ar as any)[k];
      if (typeof val === 'number' && isFinite(val) && val > 0) {
        sums[k]! += val;
      }
    }
  }

  // 4) Tính % theo AND logic: phải đạt tất cả chỉ số → lấy min(%)
  function percent(): number {
    let minPct = 100;
    for (const k of targetKeys) {
      const got = sums[k] ?? 0;
      const tgt = targets[k]!;
      const pct = Math.min(100, (got / tgt) * 100);
      if (!isFinite(pct)) return 0;
      if (pct < minPct) minPct = pct;
    }
    return Math.round(minPct * 10) / 10; // làm tròn 0.1%
  }

  return { add, percent };
}
