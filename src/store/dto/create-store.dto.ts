// create-store.dto.ts
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateStoreDto {
    @IsString()
    name: string;

    @IsString()
    companyName: string;

    @IsString()
    cameraPhoto: string;

    @IsString()
    cameraUsed: string;

    @IsNumber()
    experience: number;

    @IsString()
    phoneNumber: string;

    @IsString()
    country: string;

    @IsString()
    province: string;

    @IsString()
    city: string;

    @IsString()
    address: string;

    @IsString()
    token: string;

    @IsOptional()
    @IsString()
    combinedImageUrls?: string; 
}
