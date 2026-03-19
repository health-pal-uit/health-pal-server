import { PartialType } from '@nestjs/swagger';
import { CreateTokenTransactionDto } from './create-token_transaction.dto';

export class UpdateTokenTransactionDto extends PartialType(CreateTokenTransactionDto) {}
