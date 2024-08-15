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
import { CatalogService } from 'src/catalog/catalog.service';
import { Catalog } from 'src/catalog/entities/catalog.entity';
import { CatalogGallery } from 'src/catalog/entities/catalog-gallery.entity';
import { Category } from 'src/catalog/entities/category.entity';
import { Review } from 'src/catalog/entities/review.entity';
import { Portofolio } from 'src/portofolio/entities/portofolio.entity';
import { Booking } from 'src/booking/entities/booking.entity';
import { Store } from 'src/store/entities/store.entity';


@Module({
  imports: [TypeOrmModule.forFeature([User, ProfileUser, Catalog, CatalogGallery, Category, Review, Portofolio, Booking, Store])],
  controllers: [UsersController],
  providers: [UsersService, ProfileUserService, AuthService, EmailService, ConfigService, CatalogService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
