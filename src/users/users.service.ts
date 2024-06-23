import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ProfileUser } from 'src/profile-user/entities/profile-user.entity';
import { EmailService } from 'src/utils/email/email.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly emailService: EmailService, // Assuming AuthService has a method to send verification emails
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<any> {
    const { email, password } = createUserDto;

    this.logger.log(`[createUser] Creating user with email: ${email}`);

    // Check if email is already registered
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      this.logger.warn(`[createUser] Email ${email} is already registered`);
      throw new HttpException('Email is already registered', HttpStatus.CONFLICT);
    }

    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);
    this.logger.log(`[createUser] Password encrypted for email: ${email}`);

    const queryRunner = this.usersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create user
      const user = new User();
      user.email = email;
      user.password = hashedPassword;

      const savedUser = await queryRunner.manager.save(user);
      this.logger.log(`[createUser] User created with ID: ${savedUser.id}`);

      // Create user profile
      const userProfile = new ProfileUser();
      userProfile.user = savedUser;

      await queryRunner.manager.save(userProfile);
      await queryRunner.commitTransaction();
      this.logger.log(`[createUser] User profile created for user ID: ${savedUser.id}`);

      // Send verification email
      await this.emailService.sendVerificationEmail(savedUser.email, savedUser.verified_code);
      this.logger.log(`[createUser] Verification email sent to: ${savedUser.email}`);

      return {
        data: {
          userId: savedUser.id,
          email: savedUser.email,
          isVerified: savedUser.is_verified,
        },
        message: 'User created successfully',
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      this.logger.error(`[createUser] Error creating user: ${error.message}`);
      await queryRunner.rollbackTransaction();
      throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  // get all users
  async findAll(): Promise<User[]> {
    this.logger.log('[findAll] Fetching all users');
    const users = await this.usersRepository.find();

    if (!users.length) {
      this.logger.warn('[findAll] No users found');
      throw new HttpException('Users not found', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  // get user by id
  async findById(id: number): Promise<User> {
    this.logger.log(`[findById] Fetching user with ID: ${id}`);
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      this.logger.warn(`[findById] User not found with ID: ${id}`);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async remove(id: number) {
    this.logger.log(`[remove] Removing user with ID: ${id}`);
    try {
      await this.usersRepository.delete(id);
      this.logger.log(`[remove] User removed with ID: ${id}`);
    } catch (error) {
      this.logger.error(`[remove] Error removing user with ID: ${id} - ${error.message}`);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User> {
    this.logger.log(`[findByEmail] Fetching user with email: ${email}`);
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findByResetToken(resetToken: number): Promise<User> {
    this.logger.log(`[findByResetToken] Fetching user with reset token: ${resetToken}`);
    return await this.usersRepository.findOne({ where: { reset_password_token: resetToken } });
  }

  async saveResetPasswordToken(id: number, token: number): Promise<boolean> {
    this.logger.log(`[saveResetPasswordToken] Saving reset password token for user ID: ${id}`);
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (user) {
        user.reset_password_token = token;
        await this.usersRepository.save(user);
        this.logger.log(`[saveResetPasswordToken] Reset password token saved for user ID: ${id}`);
        return false; // Berhasil
      } else {
        this.logger.warn(`[saveResetPasswordToken] User not found with ID: ${id}`);
        return true; // Gagal, user tidak ditemukan
      }
    } catch (error) {
      this.logger.error(`[saveResetPasswordToken] Failed to save reset password token for user ID: ${id} - ${error.message}`);
      return true; // Gagal karena error
    }
  }

  async removeResetToken(userId: any): Promise<void> {
    this.logger.log(`[removeResetToken] Removing reset password token for user ID: ${userId}`);
    const user = await this.usersRepository.findOne(userId);
    if (user) {
      user.reset_password_token = null;
      await this.usersRepository.save(user);
      this.logger.log(`[removeResetToken] Reset password token removed for user ID: ${userId}`);
    }
  }
}
