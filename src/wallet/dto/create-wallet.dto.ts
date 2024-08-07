import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export enum TransactionType {
  INCOME = 1,
  WITHDRAW = 2,
}

export enum TransactionStatus {
  IN_PROGRESS = 1,
  APPROVE = 2,
  REJECT = 3,
}

export class CreateWalletTransactionDto {

  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNotEmpty()
  amount: number;

  @IsOptional()
  proofLink?: string;
}
