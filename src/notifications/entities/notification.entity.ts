import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;
}
