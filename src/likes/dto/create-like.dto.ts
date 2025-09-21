import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateLikeDto {
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID of the post to be liked',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  post_id!: string;

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID of the user who likes the post',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  user_id!: string;
}
