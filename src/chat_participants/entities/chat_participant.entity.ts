import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ApiSchema({name: ChatParticipant.name, description: 'Chat participant entity'})
@Entity('chat_participants')
export class ChatParticipant {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({type: 'boolean', default: false})
    is_admin: boolean;

    @ApiProperty()
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    joined_at: Date;
}
