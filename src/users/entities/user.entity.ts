import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Exclude } from "class-transformer";

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

@ApiSchema({name: User.name, description: 'User entity'})
@Entity('users')
export class User {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string; // @IsUUID() in dto

    @ApiProperty()
    @Column({type: 'varchar', length: 255})
    username!: string; // @IsString() in dto

    @ApiProperty()   
    @Column({type: 'varchar', length: 255})
    @Exclude({ toPlainOnly: true }) // Exclude password from the response   
    hashed_password!: string; // @IsString() in dto

    @ApiProperty()
    @Column({type: 'varchar', length: 255, unique: true})
    email: string;

    @ApiProperty()
    @Column({type: 'varchar', length: 255, nullable: true})
    phone: string;

    @ApiProperty()
    @Column({type: 'varchar', length: 255, nullable: true})
    fullname: string;

    @ApiProperty()
    @Column({type: 'boolean', default: false})
    gender: boolean;

    @ApiProperty()
    @Column({type: 'date', nullable: true})
    birth_date: Date;

    @ApiProperty()
    @Column({ type: 'enum', enum: UserRole })
    role: UserRole;

    @ApiProperty({ type: String, nullable: true, description: 'Avatar URL' })
    @Column({type: 'text', nullable: true})
    avatar_url?: string;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @ApiProperty()
    @Column({ type: 'timestamptz', nullable: true })
    deactivated_at?: Date;
}
