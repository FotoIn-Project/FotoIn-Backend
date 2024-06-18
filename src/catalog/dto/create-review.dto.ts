import { IsNotEmpty, IsNumber, IsString } from "class-validator";

// create-review.dto.ts
export class CreateReviewDto {
    @IsNumber()
    rating: number;

    @IsString()
    text: string;

    @IsString()
    photo?: string;

    @IsNumber()
    catalogId: number;

    @IsString()
    @IsNotEmpty()
    token: string;
}
