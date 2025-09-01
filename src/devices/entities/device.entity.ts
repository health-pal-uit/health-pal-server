import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;
}
