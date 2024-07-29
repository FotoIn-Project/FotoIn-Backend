import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum CartItemType {
    Cart = 1,
    Order = 2,
    History = 3,
}

export class CreateCartItemDto {
    @IsNotEmpty()
    catalogId: number;

    @IsEnum(CartItemType)
    type: CartItemType;
}