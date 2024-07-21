import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortofolioService } from './portofolio.service';
import { PortofolioController } from './portofolio.controller';
import { Portofolio } from './entities/portofolio.entity';
import { PortofolioGallery } from './entities/portofolio-gallery.entity';
import { ConfigService } from '@nestjs/config';
import { S3Service } from 'src/s3/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([Portofolio, PortofolioGallery])],
  providers: [PortofolioService, ConfigService, S3Service],
  controllers: [PortofolioController],
})
export class PortfolioModule {}
