import { IngredientPortion, Macros } from '../types/macro.type';

export function calculateMacros(portions: IngredientPortion[]): {
  total: Macros;
  per100g: Macros;
  totalWeightG: number;
} {
  let totalWeightG = 0;
  const total: Macros = {
    kcal: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
  };
  for (const portion of portions) {
    totalWeightG += portion.quantity_kg * 1000;
    const factor = portion.quantity_kg * 10; // bc per100 is per 100g, and quantity_kg is in kg
    total.kcal += (portion.per100.kcal ?? 0) * factor;
    total.protein += (portion.per100.protein ?? 0) * factor;
    total.fat += (portion.per100.fat ?? 0) * factor;
    total.carbs += (portion.per100.carbs ?? 0) * factor;
    total.fiber += (portion.per100.fiber ?? 0) * factor;
  }
  const per100g: Macros = {
    kcal: totalWeightG ? (total.kcal / totalWeightG) * 100 : 0,
    protein: totalWeightG ? (total.protein / totalWeightG) * 100 : 0,
    fat: totalWeightG ? (total.fat / totalWeightG) * 100 : 0,
    carbs: totalWeightG ? (total.carbs / totalWeightG) * 100 : 0,
    fiber: totalWeightG ? (total.fiber / totalWeightG) * 100 : 0,
  };

  const round = (x: number) => Math.round(x * 10) / 10;
  (Object.keys(per100g) as (keyof Macros)[]).forEach((k) => (per100g[k] = round(per100g[k])));

  return { total, per100g, totalWeightG };
}
