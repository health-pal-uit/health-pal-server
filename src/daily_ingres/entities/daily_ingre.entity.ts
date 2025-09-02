import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { DailyLog } from "src/daily_logs/entities/daily_log.entity";
import { Ingredient } from "src/ingredients/entities/ingredient.entity";
import { Check, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MealType } from "../meal-type.enum";

@ApiSchema({name: DailyIngre.name, description: 'DailyIngre entity'})
@Check(`quantity_kg > 0`)
@Check(`total_kcal >= 0 AND total_protein_gr >= 0 AND total_fat_gr >= 0 AND total_carbs_gr >= 0 AND total_fiber_gr >= 0`)
@Index('idx_daily_ingres_daily', ['daily_log'])
@Index('idx_daily_ingres_ingredient', ['ingredient'])
@Index('idx_daily_ingres_meal_type_time', ['meal_type', 'logged_at'])
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

    // relations => 2
    @ManyToOne(() => Ingredient, (ingredient) => ingredient.daily_ingres, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ingre_id' })
    ingredient: Ingredient;

    @ManyToOne(() => DailyLog, (dailyLog) => dailyLog.daily_ingres, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'daily_log_id' })
    daily_log: DailyLog;
}
