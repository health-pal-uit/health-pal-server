import { ActivityRecord } from 'src/activity_records/entities/activity_record.entity';

// progress accumulator for challenge activity records
export function makeProgressAccumulator(template: ActivityRecord) {
  type MetricKey = 'duration_minutes' | 'kcal_burned';

  // get metrics that template requires (target > 0)
  const metrics: MetricKey[] = ['duration_minutes', 'kcal_burned'];
  const targets: Partial<Record<MetricKey, number>> = {};
  for (const m of metrics) {
    const v = (template as any)[m];
    if (typeof v === 'number' && isFinite(v) && v > 0) {
      targets[m] = v;
    }
  }
  const targetKeys = Object.keys(targets) as MetricKey[];
  if (targetKeys.length === 0) {
    // no metrics required → 0%
    return {
      add: (_ar: ActivityRecord) => {},
      percent: () => 0,
    };
  }

  // initialize sums for each metric
  const sums: Partial<Record<MetricKey, number>> = {};
  for (const k of targetKeys) sums[k] = 0;

  // add user's activity record values
  function add(ar: ActivityRecord) {
    for (const k of targetKeys) {
      const val = (ar as any)[k];
      if (typeof val === 'number' && isFinite(val) && val > 0) {
        sums[k]! += val;
      }
    }
  }

  // calculate percentage - use min(%) to require all metrics met
  function percent(): number {
    let minPct = 100;
    for (const k of targetKeys) {
      const got = sums[k] ?? 0;
      const tgt = targets[k]!;
      const pct = Math.min(100, (got / tgt) * 100);
      if (!isFinite(pct)) return 0;
      if (pct < minPct) minPct = pct;
    }
    return Math.round(minPct * 10) / 10; // round to 0.1%
  }

  return { add, percent };
}
