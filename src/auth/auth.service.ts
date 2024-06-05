const jwt = require('jsonwebtoken');
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  //feature login
  async login(loginUserDto : LoginUserDto): Promise<any> {
    const { email, password} = loginUserDto;

    // Check if email is registered
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException(
        'Email is not registered',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Verify the password
    const isPasswordValid = await this.validatePassword(user, password);
    if (!isPasswordValid) {
      throw new HttpException(
        'Invalid password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.is_verified) {
        throw new HttpException(
          'User is not verified',
          HttpStatus.UNAUTHORIZED,
        );
      }

    // Generate JWT token
    const accessToken = await this.generateToken(user.id.toString());    

    return { accessToken };
  }

  //feature verification user
  async getStatusUser(token: string) {
    try {
      const decodedToken = await this.verifyJwtToken(token);

      // const user = await this.findUserById(decodedToken.userId)

      return {
        token,
        // isVerified : user.is_verified
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyUser(token: string) {
    try {
      const decodedToken = await this.verifyJwtToken(token);

      // Retrieve user by userId
      // const user = await this.findUserById(decodedToken.userId);

      // Check if the user is already verified
      // if (user.is_verified) {
      //     throw new HttpException('User is already verified', HttpStatus.BAD_REQUEST);
      // }

      // // Update user's is_verified status to true
      // user.is_verified = true;
      // await this.usersRepository.save(user);

      return { message: 'User verified successfully' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return { error: 'Invalid token' };
      }
      throw error;
    }
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }
  
  //token function
  async generateToken(userId: string) {
    try {
      const payload = { userId: userId };
      const token = jwt.sign(payload, process.env.JWT_SECRECT, {
        expiresIn: '2h',
      });
      return token;
    } catch (error) {
      console.log('Error generate token : ', error);
      throw new Error('Failed to generate token');
    }
  }

  async verifyJwtToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRECT);
      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
