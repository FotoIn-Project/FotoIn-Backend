import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateTransactionDto {

    @IsNotEmpty()
    paymentType: string;

    @IsNotEmpty()
    catalogId: number;

    @IsOptional()
    bank?: string;
}