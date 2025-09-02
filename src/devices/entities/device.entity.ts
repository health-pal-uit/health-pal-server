import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@ApiSchema({name: Device.name, description: 'Device entity'})
@Entity('devices')
export class Device {
    @ApiProperty({example: 'uuid', description: 'Unique identifier'})
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({example: 'device-uuid', description: 'Device unique identifier'})
    @Column({type: 'varchar'})
    device_id: string;

    @ApiProperty({example: 'push-token', description: 'Push notification token'})
    @Column({type: 'varchar'})
    push_token: string;

    @ApiProperty({example: '2023-01-01T00:00:00Z', description: 'Last active date of the device'})
    @Column({type: 'timestamptz'})
    last_active_at: Date;

    @ApiProperty({example: '2023-01-01T00:00:00Z', description: 'Creation date of the device'})
    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    // relations => 1
    @ManyToOne(() => User, (user) => user.devices, {
    eager: false,                // avoid heavy joins on lists
    onDelete: 'CASCADE',         // delete devices when user is deleted
    })
    @JoinColumn({name: 'user_id'})
    @Index('idx_devices_user')
    user: User;
}
