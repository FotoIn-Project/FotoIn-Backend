import { IsOptional, IsString, IsPhoneNumber, IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateProfileUserDto {
    
    @IsOptional()
    @IsString()
    company_name?: string;

    @IsOptional()
    @IsString()
    province?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    phone_number?: string;

    @IsOptional()
    @IsEmail()
    email_confirmation?: string;

    @IsNotEmpty()
    @IsString()
    token: string;

    @IsOptional()
    @IsEmail()
    updated_by?: string;
}
