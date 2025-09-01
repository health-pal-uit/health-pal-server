import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum FoodType {
    MEAT = 'meat',
    VEGETABLE = 'vegetable',
    FRUIT = 'fruit',
    GRAIN = 'grain',
    DAIRY = 'dairy',
    VEGAN = 'vegan', // more 2 come
}

@ApiSchema({name: Ingredient.name, description: 'Ingredient entity'})
@Entity('ingredients')
export class Ingredient {
    @ApiProperty({example: 'uuid', description: 'Unique identifier'})
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({example: 'Chicken Breast', description: 'Name of the ingredient'})
    @Column({type: 'varchar', unique: true})
    name: string; // unique

    @ApiProperty({example: 165, description: 'Calories per 100g'})
    @Column({type: 'float'})
    kcal_per_100g: number;

    @ApiProperty({example: 31, description: 'Protein per 100g'})
    @Column({type: 'float'})
    protein_per_100g: number;

    @ApiProperty({example: 5, description: 'Fat per 100g'})
    @Column({type: 'float'})
    fat_per_100g: number;

    @ApiProperty({example: 0, description: 'Carbohydrates per 100g'})
    @Column({type: 'float'})
    carbs_per_100g: number;

    @ApiProperty({example: 0, description: 'Fiber per 100g'})
    @Column({type: 'float'})
    fiber_per_100g: number;

    @ApiProperty({example: 'Notes about the ingredient', description: 'Additional notes about the ingredient'})
    @Column({type: 'text', nullable: true})
    notes: string;

    @ApiProperty({example: [FoodType.MEAT], description: 'Tags for the ingredient'})
    @Column({type: 'enum', enum: FoodType, array: true})
    tags: FoodType[];

    @ApiProperty({example: true, description: 'Indicates if the ingredient is verified'})
    @Column({type: 'boolean', default: false})
    is_verified: boolean;

    @ApiProperty({example: 'https://example.com/image.jpg', description: 'Image URL of the ingredient'})
    @Column({type: 'varchar', nullable: true})
    image_url?: string | null;

}
