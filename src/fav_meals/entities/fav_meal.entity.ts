import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Meal } from "src/meals/entities/meal.entity";
import { User } from "src/users/entities/user.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@ApiSchema({name: FavMeal.name, description: 'FavMeal entity'})
@Unique(['user', 'meal'])
@Entity('fav_meals')
export class FavMeal {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({example: 'uuid', description: 'Unique identifier'})
    id: string;

    // relations => 2
    @ManyToOne(() => User, (user) => user.fav_meals)
    @JoinColumn({name: 'user_id'})
    user: User;

    @ManyToOne(() => Meal, (meal) => meal.fav_meals)
    @JoinColumn({name: 'meal_id'})
    meal: Meal;
}
