import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { FoodType } from "src/ingredients/entities/ingredient.entity";
import { Check, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Check(`"rating" >= 0 AND "rating" <= 5`)
@ApiSchema({name: Meal.name, description: 'Meal entity'})
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
    @Column({type: 'float'})
    rating: number;

    @ApiProperty({example: [FoodType.MEAT], description: 'Tags for the meal'})
    @Column({type: 'enum', enum: FoodType, array: true})
    tags: FoodType[];

    @ApiProperty({example: 'Notes about the meal', description: 'Additional notes about the meal'})
    @Column({type: 'text', nullable: true})
    notes: string;

    @ApiProperty({example: '2023-01-01T00:00:00.000Z', description: 'Creation date of the meal'})
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;

    @ApiProperty({example: true, description: 'Indicates if the meal is verified'})
    @Column({type: 'boolean', default: false})
    is_verified: boolean;

    @ApiProperty({example: 'https://example.com/image.jpg', description: 'Image URL of the meal'})
    @Column({type: 'varchar', nullable: true})
    image_url?: string | null;
}
