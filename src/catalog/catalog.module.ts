import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { Catalog } from './entities/catalog.entity';
import { CatalogGallery } from './entities/catalog-gallery.entity';
import { Category } from './entities/category.entity';
import { JwtService } from 'src/utils/jwt/jwt.service';
import { ConfigService } from '@nestjs/config';
import { ProfileUser } from 'src/profile-user/entities/profile-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Catalog, CatalogGallery, Category, ProfileUser])],
  controllers: [CatalogController],
  providers: [CatalogService, JwtService, ConfigService],
})
export class CatalogModule {}
