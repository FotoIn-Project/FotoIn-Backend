import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ProfileUserService } from 'src/profile-user/profile-user.service';
import { ProfileUser } from 'src/profile-user/entities/profile-user.entity';
import { EmailService } from 'src/utils/email/email.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { UsersService } from 'src/users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt/jwt.auth.guard';
import { CatalogService } from 'src/catalog/catalog.service';
import { Catalog } from 'src/catalog/entities/catalog.entity';
import { CatalogGallery } from 'src/catalog/entities/catalog-gallery.entity';
import { Category } from 'src/catalog/entities/category.entity';
import { Review } from 'src/catalog/entities/review.entity';
import { Portofolio } from 'src/portofolio/entities/portofolio.entity';
import { Booking } from 'src/booking/entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ProfileUser, Catalog, CatalogGallery, Category, Review, Portofolio, Booking]),
  JwtModule.register({
    secret: Buffer.from('eW91ci0yNTYtYml0LXNlY3JldA==', 'base64').toString('ascii'), // Gunakan secret yang sama
    signOptions: { expiresIn: '1h' },
  })],
  controllers: [AuthController],
  providers: [AuthService, ProfileUserService, UsersService, EmailService, JwtStrategy, JwtAuthGuard, CatalogService],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
