import { IsNotEmpty } from "class-validator";

export class CreateReviewDto {
    @IsNotEmpty()
    rating: number;

    @IsNotEmpty()
    text: string;

    @IsNotEmpty()
    catalogId: number;

    photo?: string;
}
