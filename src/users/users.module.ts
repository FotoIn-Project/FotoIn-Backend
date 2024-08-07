import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ProfileUser } from 'src/profile-user/entities/profile-user.entity';
import { ProfileUserService } from 'src/profile-user/profile-user.service';
import { AuthService } from 'src/auth/auth.service';
import { EmailService } from 'src/utils/email/email.service';
import { ConfigService } from '@nestjs/config';
import { WalletTransaction } from 'src/wallet/entities/wallet.entity';


@Module({
  imports: [TypeOrmModule.forFeature([User, ProfileUser])],
  controllers: [UsersController],
  providers: [UsersService, ProfileUserService, AuthService, EmailService, ConfigService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
