import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { TokenTransactionStatus, TokenTransactionType } from '../entities/token_transaction.entity';

export class CreateTokenTransactionDto {
  @ApiProperty({ example: 'uuid', description: 'Wallet ID' })
  @IsNotEmpty()
  @IsUUID('4')
  wallet_id: string;

  @ApiProperty({ enum: TokenTransactionType, description: 'Credit or debit transaction type' })
  @IsNotEmpty()
  @IsEnum(TokenTransactionType)
  type: TokenTransactionType;

  @ApiProperty({ example: 12.5, description: 'Token amount' })
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: '0xabc123...', required: false })
  @IsOptional()
  @IsString()
  tx_hash?: string;

  @ApiProperty({ enum: TokenTransactionStatus, required: false })
  @IsOptional()
  @IsEnum(TokenTransactionStatus)
  status?: TokenTransactionStatus;

  @ApiProperty({ example: 'uuid', description: 'Optional related entity ID', required: false })
  @IsOptional()
  @IsUUID('4')
  reference_id?: string;

  @ApiProperty({ example: 'Booking payment', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
