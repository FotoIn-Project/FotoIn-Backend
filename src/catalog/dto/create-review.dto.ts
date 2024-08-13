import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateReviewDto {
    @IsNotEmpty()
    rating: number;

    @IsNotEmpty()
    text: string;

    @IsNotEmpty()
    catalogId: number;

    @IsOptional()
    photo?: string;
}
