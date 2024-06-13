import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portofolio } from './entities/portofolio.entity';
import { PortofolioGallery } from './entities/portofolio-gallery.entity';
import { CreatePortofolioDto } from './dto/create-portofolio.dto';
import { JwtService } from 'src/utils/jwt/jwt.service';

@Injectable()
export class PortofolioService {
  constructor(
    @InjectRepository(Portofolio)
    private readonly portfolioRepository: Repository<Portofolio>,
    @InjectRepository(PortofolioGallery)
    private readonly portfolioGalleryRepository: Repository<PortofolioGallery>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createPortfolioDto: CreatePortofolioDto, token: string, photoPaths: string[]): Promise<Portofolio> {

    const decoded = await this.jwtService.verifyJwtToken(token);

    const portfolio = this.portfolioRepository.create({
      ...createPortfolioDto,
      ownerId: decoded.userId,
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

  async findOneById(id: number, token: string): Promise<Portofolio> {
    if (!id) {
      throw new BadRequestException('Portfolio ID is required');
    }


    await this.jwtService.verifyJwtToken(token);
    
    const portfolio = await this.portfolioRepository.findOne({
      where: { id },
      relations: ['gallery'],
    });

    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${id} not found`);
    }

    return portfolio;
  }

  async findByOwner(token: string): Promise<Portofolio[]> {
    const decoded = await this.jwtService.verifyJwtToken(token);
    const portfolios = await this.portfolioRepository.find({
      where: { ownerId: decoded.userId },
      relations: ['gallery'],
    });

    console.log(portfolios.length);
    

    if (!portfolios || portfolios.length === 0) {
      throw new NotFoundException(`No portfolios found for user ID ${decoded.userId}`);
    }

    return portfolios;
  }
}
