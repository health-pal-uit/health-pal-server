import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Medal } from 'src/medals/entities/medal.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

@ApiSchema({ name: MedalsUser.name, description: 'Medals User entity' })
@Unique('UQ_medals_users_user_medal', ['user', 'medal'])
@Entity('medals_users')
export class MedalsUser {
  @ApiProperty({ example: 'uuid', description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: new Date(), description: 'Date when the medal was achieved' })
  @Column('timestamptz')
  achieved_at: Date;

  // relations => 2
  @ManyToOne(() => Medal, (medal) => medal.medals_users, { eager: true })
  @JoinColumn({ name: 'medal_id' })
  medal: Medal;

  @ManyToOne(() => User, (user) => user.medals_users, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // reflects
}
