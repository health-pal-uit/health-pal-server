import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn } from "typeorm";

@ApiSchema({name: FavIngre.name, description: 'FavIngre entity'})
@Entity('fav_ingres')
export class FavIngre {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({example: 'uuid', description: 'Unique identifier'})
    id: string;
}
