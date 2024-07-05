import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portofolio } from './entities/portofolio.entity';
import { PortofolioGallery } from './entities/portofolio-gallery.entity';
import { CreatePortofolioDto } from './dto/create-portofolio.dto';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class PortofolioService {
  constructor(
    @InjectRepository(Portofolio)
    private readonly portfolioRepository: Repository<Portofolio>,
    @InjectRepository(PortofolioGallery)
    private readonly portfolioGalleryRepository: Repository<PortofolioGallery>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createPortfolioDto: CreatePortofolioDto, currentUserId: number, photoPaths: string[]): Promise<Portofolio> {

    const portfolio = this.portfolioRepository.create({
      ...createPortfolioDto,
      ownerId: currentUserId,
    });

    const savedPortfolio = await this.portfolioRepository.save(portfolio);

    const galleryItems = photoPaths.map(path => {
      const galleryItem = this.portfolioGalleryRepository.create({
        path,
        portfolioId: savedPortfolio.id,
      });
      return this.portfolioGalleryRepository.save(galleryItem);
    });

    await Promise.all(galleryItems);

    return this.portfolioRepository.findOne({
      where: { id: savedPortfolio.id },
      relations: ['gallery'],
    });
  }

  async findOneById(id: number): Promise<Portofolio> {    
    const portfolio = await this.portfolioRepository.findOne({
      where: { id },
      relations: ['gallery'],
    });

    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${id} not found`);
    }

    return portfolio;
  }

  async findByOwner(currentUserId: number): Promise<Portofolio[]> {
    const portfolios = await this.portfolioRepository.find({
      where: { ownerId: currentUserId },
      relations: ['gallery'],
    });

    if (!portfolios || portfolios.length === 0) {
      throw new NotFoundException(`No portfolios found for user ID ${currentUserId}`);
    }

    return portfolios;
  }
}
