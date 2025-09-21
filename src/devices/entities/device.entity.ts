import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ApiSchema({ name: Device.name, description: 'Device entity' })
@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  device_id: string;

  @Column({ type: 'varchar' })
  push_token: string;

  @Column({ type: 'timestamptz' })
  last_active_at: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // relations => 1
  @ManyToOne(() => User, (user) => user.devices, {
    eager: false, // avoid heavy joins on lists
    onDelete: 'CASCADE', // delete devices when user is deleted
  })
  @JoinColumn({ name: 'user_id' })
  @Index('idx_devices_user')
  user: User;
}
