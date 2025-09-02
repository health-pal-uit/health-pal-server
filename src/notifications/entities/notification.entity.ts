import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@ApiSchema({name: Notification.name, description: 'Notification entity'})
@Entity('notifications')
export class Notification {
    @ApiProperty({example: 'uuid', description: 'Unique identifier'})
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({example: 'This is a notification', description: 'Content of the notification'})
    @Column({type: 'text'})
    content: string;

    @ApiProperty({example: 'Notification Title', description: 'Title of the notification'})
    @Column({type: 'varchar', length: 255})
    title: string;

    @ApiProperty({example: false, description: 'Indicates if the notification is read'})
    @Column({type: 'boolean', default: false})
    is_read: boolean;

    @ApiProperty({example: '2023-01-01T00:00:00Z', description: 'Creation date of the notification'})
    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    // relations => 1
    @ManyToOne(() => User, (user) => user.notifications, {
    eager: false,               
    onDelete: 'CASCADE',         // delete notifications when user is deleted
    })
    @JoinColumn({name: 'user_id'})
    @Index('idx_notifications_user')
    user: User;
}
