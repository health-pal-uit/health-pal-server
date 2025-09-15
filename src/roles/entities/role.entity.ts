import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@ApiSchema({name: Role.name, description: 'Role entity'})
@Entity('roles')
export class Role {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string; // @IsUUID() in dto

    @ApiProperty()
    @Column({type: 'varchar', length: 255, unique: true})
    name!: string; // @IsString() in dto

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    // relations

    // reflects
    
    @ManyToOne(() => User, (user) => user.roles)
    user: User;
}
