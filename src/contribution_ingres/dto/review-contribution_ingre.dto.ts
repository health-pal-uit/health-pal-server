import { FoodType } from 'src/helpers/enums/food-type.enum';

export class ReviewableContributionIngreDto {
  // for client submit when editing an existing Ingre:
  // opt is implied by route or explicit here
  opt: 'EDIT' | 'DELETE_REQUEST';

  ingre_id: string; // required for EDIT/DELETE

  // optional new payload if EDIT
  name?: string;
  kcal_per_100gr?: number;
  protein_per_100gr?: number;
  fat_per_100gr?: number;
  carbs_per_100gr?: number;
  fiber_per_100gr?: number;
  notes?: string;
  tags?: FoodType[];
  image_url?: string | null;
}
