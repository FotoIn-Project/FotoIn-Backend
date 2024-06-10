import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './users/users.module';
import { ProfileUserModule } from './profile-user/profile-user.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { ProfileUser } from './profile-user/entities/profile-user.entity';
import { DataSource } from 'typeorm';
import { EmailService } from './utils/email/email.service';
import { JwtService } from './utils/jwt/jwt.service';
import { CatalogModule } from './catalog/catalog.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username:  process.env.DATABASE_USERNAME_PROD,
      password:  process.env.DATABASE_PASSWORD_PROD,
      database: process.env.DATABASE_NAME_PROD,
      synchronize: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    UsersModule,
    ProfileUserModule,
    AuthModule,
    CatalogModule,
  ],
  controllers: [],
  providers: [EmailService, JwtService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}

