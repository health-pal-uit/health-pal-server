import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn } from "typeorm";

@ApiSchema({name: FavMeal.name, description: 'FavMeal entity'})
@Entity('fav_meals')
export class FavMeal {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({example: 'uuid', description: 'Unique identifier'})
    id: string;
}
