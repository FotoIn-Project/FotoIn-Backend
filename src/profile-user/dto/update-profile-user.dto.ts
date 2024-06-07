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
    @IsPhoneNumber(null)
    phone_number?: string;

    @IsOptional()
    @IsEmail()
    email_confirmation?: string;

    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    accessToken : string;

    @IsOptional()
    @IsEmail()
    updated_by?: string;
}
