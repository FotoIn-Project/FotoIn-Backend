import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePortofolioDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  tags: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}
