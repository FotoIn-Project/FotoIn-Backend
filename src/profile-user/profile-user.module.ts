import { Module } from '@nestjs/common';
import { ProfileUserService } from './profile-user.service';
import { ProfileUserController } from './profile-user.controller';
import { ProfileUser } from './entities/profile-user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { CatalogService } from 'src/catalog/catalog.service';
import { Catalog } from 'src/catalog/entities/catalog.entity';
import { CatalogGallery } from 'src/catalog/entities/catalog-gallery.entity';
import { Category } from 'src/catalog/entities/category.entity';
import { Review } from 'src/catalog/entities/review.entity';
import { Portofolio } from 'src/portofolio/entities/portofolio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileUser, User, Catalog, CatalogGallery, Category, Review, Portofolio]),],
  controllers: [ProfileUserController],
  providers: [ProfileUserService, ConfigService, CatalogService],
})
export class ProfileUserModule {}
