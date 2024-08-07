import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TransactionStatus } from './create-wallet.dto';

export class UpdateTransactionStatusDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

}
