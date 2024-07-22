import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePortofolioDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  categoryId: number;

}
