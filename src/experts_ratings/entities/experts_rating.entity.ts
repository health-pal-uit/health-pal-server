import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Consultation } from "src/consultations/entities/consultation.entity";
import { Expert } from "src/experts/entities/expert.entity";
import { User } from "src/users/entities/user.entity";
import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@ApiSchema({name: ExpertsRating.name, description: 'ExpertsRating entity'})
@Check(`"rating" >= 0 AND "rating" <= 5`)
@Unique(['expert', 'user']) // mỗi user chỉ được rate 1 expert 1 lần
@Entity('experts_ratings')
export class ExpertsRating {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({type: 'float'})
    rating: number;

    @ApiProperty()
    @Column({type: 'text', nullable: true})
    review: string;

    @ApiProperty()
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;

    // relations => 3
    @ManyToOne(() => Expert, (expert) => expert.expert_ratings)
    @JoinColumn({ name: 'expert_id' }) // tạo cột expert_id trong table experts_ratings
    expert: Expert;

    // tới user, còn unique nữa
    @ManyToOne(() => User,(user) => user.expert_ratings, { eager: true })
    @JoinColumn({ name: 'user_id' }) // tạo cột user_id trong table experts_ratings
    user: User;

    @OneToOne(() => Consultation, (consultation) => consultation.experts_rating)
    @JoinColumn({ name: 'consultation_id' })
    consultation: Consultation;
}
