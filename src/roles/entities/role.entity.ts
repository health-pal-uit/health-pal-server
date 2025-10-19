import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ApiSchema({ name: Role.name, description: 'Role entity' })
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string; // @IsUUID() in dto

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string; // @IsString() in dto

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at!: Date | null;

  // relations

  // reflects

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
