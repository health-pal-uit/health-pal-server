import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ApiSchema({name: MedalsUser.name, description: 'Medals User entity'})
@Entity('medals_users')
export class MedalsUser {
    @ApiProperty({example: 'uuid', description: 'Unique identifier'})
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({example: new Date(), description: 'Date when the medal was achieved'})
    @Column('timestamptz')
    achieved_at: Date;
}
