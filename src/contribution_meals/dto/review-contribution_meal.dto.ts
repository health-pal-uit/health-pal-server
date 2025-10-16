import { FoodType } from 'src/helpers/enums/food-type.enum';

export class ReviewableContributionMealDto {
  // for client submit when editing an existing meal:
  // opt is implied by route or explicit here
  opt: 'EDIT' | 'DELETE_REQUEST';

  meal_id: string; // required for EDIT/DELETE

  // optional new payload if EDIT
  name?: string;
  serving_gr?: number | null;
  kcal_per_100gr?: number;
  protein_per_100gr?: number;
  fat_per_100gr?: number;
  carbs_per_100gr?: number;
  fiber_per_100gr?: number;
  notes?: string;
  tags?: FoodType[];
  image_url?: string | null;
}
