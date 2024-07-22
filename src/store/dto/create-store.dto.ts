// create-store.dto.ts
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateStoreDto {
    @IsString()
    name: string;

    userId: number;

    @IsString()
    companyName: string;

    cameraPhoto: string;

    @IsString()
    cameraUsed: string;

    @IsString()
    experience: string;

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

    @IsOptional()
    @IsString()
    combinedImageUrls?: string; 
}
