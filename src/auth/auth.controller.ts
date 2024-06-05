import { Controller, Get, Param, Body, ValidationPipe } from '@nestjs/common';
import { Post, UsePipes } from '@nestjs/common/decorators';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService : AuthService,
        private readonly usersService: UsersService,
    ){}

    @Get("verify/:token")
    async getStatusUser(@Param("token") token: string){
        try {
            const getStatusUser = await this.authService.getStatusUser(token)
            return getStatusUser;
        } catch (error) { 
            throw error  
        }
    }

    @Post('verify')
    async verifyUser(@Body() body: { token: string }): Promise<any> {
        try {
            const token = body.token;
            return await this.authService.verifyUser(token)
        } catch (error) {
           throw error; 
        }
    }

    @Post('login')
    async login(@Body() body: { email: string, password : string }): Promise<any> {
        try {
            var {email, password} = body;
            return await this.authService.login(email, password)
        } catch (error) {
           throw error; 
        }
    }

    @Post("forgot-password")
    async forgotPassword(@Body() body:{ email : string}){
        try {
            const {email} = body;
            return await this.authService.forgotPassword(email)
        } catch (error) {
            throw error;
        }
   }

   @Post("change-password")
   async changePassword(@Body() body : { token : string, newPassword : string}){
    try {
        const {token, newPassword} = body;
        return await this.authService.changePassword(token, newPassword);
    } catch (error) {
        throw error;
    }
   }

    @Post('sign-up')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async signUp(@Body() createUserDto: CreateUserDto): Promise<any> {
    try {
        return await this.usersService.createUser(createUserDto);
    } catch (error) {
        throw error;
    }
  }
}
