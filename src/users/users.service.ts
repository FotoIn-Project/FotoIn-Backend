import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ProfileUser } from 'src/profile-user/entities/profile-user.entity';
import { EmailService } from 'src/utils/email/email.service';
import * as bcrypt from 'bcrypt';
import { CreateUserResponse } from './dto/create-user-response';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly emailService: EmailService, // Assuming AuthService has a method to send verification emails
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<CreateUserResponse> {
    const { email, password} = createUserDto;

    // Check if email is already registered
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new HttpException('Email is already registered', HttpStatus.CONFLICT);
    }

    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const queryRunner = this.usersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create user
      const user = new User();
      user.email = email;
      user.password = hashedPassword;

      const savedUser = await queryRunner.manager.save(user);

      // Create user profile
      const userProfile = new ProfileUser();
      userProfile.user = savedUser;

      await queryRunner.manager.save(userProfile);
      await queryRunner.commitTransaction();

      // Send verification email
      await this.emailService.sendVerificationEmail("payogot@gmail.com", "test test"); //TODO change token and email

      return {
        data: savedUser,
        message: 'User created successfully',
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  // get all users
  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();

    if (!users.length) {
      throw new HttpException('Users not found', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  // get user by id
  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async remove(id: number) {
    try {
      await this.usersRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findByResetToken(resetToken: string): Promise<User> {
    return await this.usersRepository.findOne({ where: { reset_password_token : resetToken } });
  }

  async saveResetPasswordToken(id: number, token: string): Promise<boolean> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (user) {
        user.reset_password_token = token;
        await this.usersRepository.save(user);
        return false; // Berhasil
      } else {
        return true; // Gagal, user tidak ditemukan
      }
    } catch (error) {
      console.error('Failed to save reset password token:', error);
      return true; // Gagal karena error
    }
  }

  async removeResetToken(userId: any): Promise<void> {
    const user = await this.usersRepository.findOne(userId);
    if (user) {
      user.reset_password_token = null;
      await this.usersRepository.save(user);
    }
  }
}
