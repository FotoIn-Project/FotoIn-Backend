import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ProfileUserService } from 'src/profile-user/profile-user.service';
import { ProfileUser } from 'src/profile-user/entities/profile-user.entity';
import { UsersModule } from 'src/users/users.module';
import { EmailService } from 'src/utils/email/email.service';
import { JwtService } from 'src/utils/jwt/jwt.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([User, ProfileUser])],
  controllers: [AuthController],
  providers: [AuthService, UsersService, ProfileUserService, EmailService, JwtService, ConfigService],
  exports : []
})
export class AuthModule {}
