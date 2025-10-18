export type Macros = {
  kcal: number;
  protein: number; // g
  fat: number; // g
  carbs: number; // g
  fiber: number; // g
};

export type IngredientPortion = {
  quantity_kg: number; // e.g. 0.2 = 200 g
  per100: Partial<Macros>; // e.g. from ingredient: *_per_100gr
};
