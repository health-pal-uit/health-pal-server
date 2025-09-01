import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Check, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ApiSchema({name: ExpertsRating.name, description: 'ExpertsRating entity'})
@Check(`"rating" >= 0 AND "rating" <= 5`)
@Entity('experts_ratings')
export class ExpertsRating {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({type: 'float'})
    rating: number;

    @ApiProperty()
    @Column({type: 'text', nullable: true})
    review: string;

    @ApiProperty()
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;
}
