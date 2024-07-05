import { IsNotEmpty } from "class-validator";

export class CreateProfileUserDto {
    @IsNotEmpty()
    username : string;

    @IsNotEmpty()
    email : string;

    @IsNotEmpty()
    userId : number;

}
