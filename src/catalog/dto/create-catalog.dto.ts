import { IsString, IsNumber, IsArray, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateCatalogDto {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    price: number;

    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    availableDate: string;

    @IsNotEmpty()
    location: string;

    @IsNotEmpty()
    categoryId: number;

    @IsNotEmpty()
    portofolioId: number;

    combinedImageUrls: string;
}



