import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortofolioService } from './portofolio.service';
import { PortofolioController } from './portofolio.controller';
import { Portofolio } from './entities/portofolio.entity';
import { PortofolioGallery } from './entities/portofolio-gallery.entity';
import { JwtService } from 'src/utils/jwt/jwt.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Portofolio, PortofolioGallery])],
  providers: [PortofolioService, JwtService, ConfigService],
  controllers: [PortofolioController],
})
export class PortfolioModule {}
