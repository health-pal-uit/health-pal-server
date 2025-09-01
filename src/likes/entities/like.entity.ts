import { ApiSchema } from "@nestjs/swagger";
import { Check, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@ApiSchema({name: Like.name, description: 'Like entity'})
@Unique('UQ_user_post_like', ['user', 'post']) // no relations yet
@Entity('likes')
export class Like {
    @PrimaryGeneratedColumn('uuid')
    id: string;
}
