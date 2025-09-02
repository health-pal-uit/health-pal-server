import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { DailyMeal } from "src/daily_meals/entities/daily_meal.entity";
import { FavMeal } from "src/fav_meals/entities/fav_meal.entity";
import { IngreMeal } from "src/ingre_meals/entities/ingre_meal.entity";
import { Check, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FoodType } from "src/ingredients/food-type.enum";

@ApiSchema({name: Meal.name, description: 'Meal entity'})
@Check(`rating >= 0 AND rating <= 5`)
@Check(`kcal_per_100g >= 0 AND protein_per_100g >= 0 AND fat_per_100g >= 0 AND carbs_per_100g >= 0 AND fiber_per_100g >= 0`)
@Entity('meals')
export class Meal {
    @ApiProperty({example: 'uuid', description: 'Unique identifier'})
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({example: 'Chicken Salad', description: 'Name of the meal'})
    @Column({type: 'varchar'})
    name: string;

    @ApiProperty({example: 250, description: 'Calories per 100g'})
    @Column({type: 'float'})
    kcal_per_100g: number;

    @ApiProperty({example: 30, description: 'Protein per 100g'})
    @Column({type: 'float'})
    protein_per_100g: number;

    @ApiProperty({example: 10, description: 'Fat per 100g'})
    @Column({type: 'float'})
    fat_per_100g: number;

    @ApiProperty({example: 40, description: 'Carbohydrates per 100g'})
    @Column({type: 'float'})
    carbs_per_100g: number;

    @ApiProperty({example: 5, description: 'Fiber per 100g'})
    @Column({type: 'float'})
    fiber_per_100g: number;

    @ApiProperty({example: 4.5, description: 'Rating of the meal'})
    @Column({type: 'float', default: 0 })
    rating: number;

    @ApiProperty({example: [FoodType.MEAT], description: 'Tags for the meal'})
    @Column({type: 'enum', enum: FoodType, array: true})
    tags: FoodType[];

    @ApiProperty({example: 'Notes about the meal', description: 'Additional notes about the meal'})
    @Column({type: 'text', nullable: true})
    notes: string;

    @ApiProperty({example: '2023-01-01T00:00:00.000Z', description: 'Creation date of the meal'})
    @CreateDateColumn({type: 'timestamptz'})
    created_at: Date;

    @ApiProperty({example: true, description: 'Indicates if the meal is verified'})
    @Column({type: 'boolean', default: false})
    is_verified: boolean;

    @ApiProperty({example: 'https://example.com/image.jpg', description: 'Image URL of the meal'})
    @Column({type: 'text', nullable: true})
    image_url?: string | null;

    // relations => 0

    // reflects
    @OneToMany(() => IngreMeal, (ingreMeal) => ingreMeal.meal)
    ingre_meals: IngreMeal[];

    @OneToMany(() => DailyMeal, (dailyMeal) => dailyMeal.meal)
    daily_meals: DailyMeal[];

    @OneToMany(() => FavMeal, (favMeal) => favMeal.meal)
    fav_meals: FavMeal[];

}
