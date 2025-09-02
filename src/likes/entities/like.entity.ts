import { ApiSchema } from "@nestjs/swagger";
import { Post } from "src/posts/entities/post.entity";
import { User } from "src/users/entities/user.entity";
import { Check, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@ApiSchema({name: Like.name, description: 'Like entity'})
@Unique('UQ_user_post_like', ['user', 'post']) // no relations yet
@Entity('likes')
export class Like {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // relations => 2
    @ManyToOne(() => User, (user) => user.likes, {eager: true})
    @JoinColumn({name: 'user_id'})
    @Index('idx_likes_user')
    user: User;

    @ManyToOne(() => Post, (post) => post.likes, {eager: true})
    @JoinColumn({name: 'post_id'})
    @Index('idx_likes_post')
    post: Post;

    // reflects
}
