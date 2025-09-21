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

@ApiSchema({ name: Notification.name, description: 'Notification entity' })
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // relations => 1
  @ManyToOne(() => User, (user) => user.notifications, {
    eager: false,
    onDelete: 'CASCADE', // delete notifications when user is deleted
  })
  @JoinColumn({ name: 'user_id' })
  @Index('idx_notifications_user')
  user: User;
}
