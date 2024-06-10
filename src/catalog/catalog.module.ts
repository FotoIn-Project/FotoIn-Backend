import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { Catalog } from './entities/catalog.entity';
import { CatalogGallery } from './entities/catalog-gallery.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Catalog, CatalogGallery])],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
