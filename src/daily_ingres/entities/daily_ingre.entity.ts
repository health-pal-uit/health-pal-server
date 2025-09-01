import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum MealType {
    BREAKFAST = 'breakfast',
    LUNCH = 'lunch',
    DINNER = 'dinner',
    SNACK = 'snack'
}

@ApiSchema({name: DailyIngre.name, description: 'DailyIngre entity'})
@Entity('daily_ingres')
export class DailyIngre {
    @ApiProperty({example: 'uuid', description: 'Unique identifier'})
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({example: 1, description: 'Quantity in kg'})
    @Column({type: 'float'})
    quantity_kg: number;

    @ApiProperty({example: 250, description: 'Total calories'})
    @Column({type: 'float'})
    total_kcal: number;

    @ApiProperty({example: 30, description: 'Total protein in grams'})
    @Column({type: 'float'})
    total_protein_gr: number;

    @ApiProperty({example: 10, description: 'Total fat in grams'})
    @Column({type: 'float'})
    total_fat_gr: number;

    @ApiProperty({example: 100, description: 'Total carbohydrates in grams'})
    @Column({type: 'float'})
    total_carbs_gr: number;

    @ApiProperty({example: 5, description: 'Total fiber in grams'})
    @Column({type: 'float'})
    total_fiber_gr: number;

    @ApiProperty({example: 'breakfast', description: 'Meal type', enum: MealType})
    @Column({type: 'enum', enum: MealType})
    meal_type: MealType;

    @ApiProperty({example: '2023-01-01T00:00:00Z', description: 'Logged at'})
    @Column({type: 'timestamptz'})
    logged_at: Date;
}
