import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { ChallengesMedal } from "src/challenges_medals/entities/challenges_medal.entity";
import { MedalsUser } from "src/medals_users/entities/medals_user.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";

export enum MedalTier {
    BRONZE = 'bronze',
    SILVER = 'silver',
    GOLD = 'gold',
    PLATINUM = 'platinum'
}

@ApiSchema({name: Medal.name, description: 'Medal entity'})
@Entity('medals')
export class Medal {
    @ApiProperty({example: 'uuid', description: 'Unique identifier'})
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', {length: 255, unique: true})
    @ApiProperty({example: 'Gold Medal', description: 'Name of the medal'})
    name: string;

    @Column('text', {nullable: true})
    @ApiProperty({example: 'https://example.com/gold-medal.png', description: 'Image URL of the medal'})
    image_url?: string;

    @Column('enum', {enum: MedalTier})
    @ApiProperty({example: MedalTier.GOLD, description: 'Tier of the medal'})
    tier: MedalTier;

    @Column('text', {nullable: true})
    @ApiProperty({example: 'This is a note', description: 'Additional note about the medal'})
    note?: string;

    @Column('timestamptz', {default: () => 'CURRENT_TIMESTAMP'})
    @ApiProperty({example: new Date(), description: 'Creation date of the medal'})
    created_at: Date;

    // relations => 0

    // reflects
    @OneToMany(() => ChallengesMedal, (challengesMedal) => challengesMedal.medal)
    challenges_medals: ChallengesMedal[];

    @OneToMany(() => MedalsUser, (medalsUser) => medalsUser.medal)
    medals_users: MedalsUser[];
}
