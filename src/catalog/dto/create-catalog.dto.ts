import { IsString, IsNumber, IsArray, IsDateString } from 'class-validator';

export class CreateCatalogDto {
    @IsString()
    title: string;

    @IsNumber()
    price: number;

    @IsString()
    description: string;

    @IsString()
    combinedImageUrls: string;

    @IsArray()
    @IsString({ each: true })
    tags: string[];

    @IsDateString()
    availableDate: Date;

    @IsString()
    location: string;
}



