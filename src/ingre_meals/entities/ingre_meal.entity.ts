import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ApiSchema({name: IngreMeal.name, description: 'IngreMeal entity'})
@Entity('ingre_meals')
export class IngreMeal {
    @ApiProperty({description: 'Unique identifier for the ingredient meal'})
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({description: 'Quantity of the ingredient meal in kilograms'})
    @Column({type: 'float'})
    quantity_kg: number;
}
