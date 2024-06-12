import { Module } from '@nestjs/common';
import { ProfileUserService } from './profile-user.service';
import { ProfileUserController } from './profile-user.controller';
import { ProfileUser } from './entities/profile-user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from 'src/utils/jwt/jwt.service';
import { UsersModule } from 'src/users/users.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileUser]), UsersModule,],
  controllers: [ProfileUserController],
  providers: [ProfileUserService, JwtService, ConfigService],
})
export class ProfileUserModule {}
