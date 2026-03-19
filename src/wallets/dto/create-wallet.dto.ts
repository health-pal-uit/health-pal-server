import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({ example: 'uuid', description: 'Owner user ID' })
  @IsNotEmpty()
  @IsUUID('4')
  user_id: string;

  @ApiProperty({ example: 'polygon-mainnet', description: 'Blockchain network identifier' })
  @IsNotEmpty()
  @IsString()
  chain_id: string;

  @ApiProperty({ example: '0x1234abcd...', description: 'Wallet address' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber()
  @Min(0)
  token_balance_cache?: number;
}
