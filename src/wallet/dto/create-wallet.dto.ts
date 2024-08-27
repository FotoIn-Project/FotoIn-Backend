import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export enum TransactionType {
  INCOME = 'INCOME',
  WITHDRAW = 'WITHDRAW',
}

export enum TransactionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export enum TransactionMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export class CreateWalletTransactionDto {

  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @IsNumber()
  catalogId?: number;

  @IsOptional()
  @IsString()
  proofLink?: string;

  @IsOptional()
  amount : number;

  @IsOptional() // Required only for withdrawal transactions
  @IsEnum(TransactionMethod)
  method?: TransactionMethod;

  @IsOptional() // Required only for withdrawal transactions
  @IsString()
  accountName?: string;

  @IsOptional() // Required only for withdrawal transactions
  @IsString()
  accountNumber?: string;
  
  @IsOptional() // Required only for withdrawal transactions
  @IsString()
  bankName?: string;
}
