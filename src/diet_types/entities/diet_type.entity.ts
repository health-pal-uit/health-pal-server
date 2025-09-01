import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum DietTypeName {
    KETO = 'keto',
    PALEO = 'paleo',
    VEGAN = 'vegan',
    MEDITERRANEAN = 'mediterranean',
    DASH = 'dash',
}

@ApiSchema({name: DietType.name, description: 'DietType entity'})
@Entity('diet_types')
export class DietType {
    @ApiProperty({example: 'uuid', description: 'Unique identifier'})
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @ApiProperty({enum: DietTypeName, description: 'Name of the diet type'})
    @Column({type: 'enum', enum: DietTypeName, unique: true})
    name: DietTypeName;

    @ApiProperty({example: 20, description: 'Percentage of protein in the diet type'})
    @Column({type: 'float'})
    protein_percentages: number;

    @ApiProperty({example: 30, description: 'Percentage of fat in the diet type'})
    @Column({type: 'float'})
    fat_percentages: number;

    @ApiProperty({example: 40, description: 'Percentage of carbohydrates in the diet type'})
    @Column({type: 'float'})
    carbs_percentages: number;

    @ApiProperty({example: '2022-01-01T00:00:00.000Z', description: 'Creation date of the diet type'})
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;
}
