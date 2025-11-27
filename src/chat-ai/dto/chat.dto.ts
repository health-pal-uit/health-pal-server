import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsArray()
  @IsOptional()
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}
