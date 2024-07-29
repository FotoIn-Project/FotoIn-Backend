import { IsEnum } from "class-validator";
import { CartItemType } from "./create-cart.dto";

export class UpdateCartItemDto {
    @IsEnum(CartItemType)
    type: CartItemType;
}