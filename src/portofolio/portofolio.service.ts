import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portofolio } from './entities/portofolio.entity';
import { PortofolioGallery } from './entities/portofolio-gallery.entity';
import { CreatePortofolioDto } from './dto/create-portofolio.dto';
import { JwtService } from '@nestjs/jwt';
import { Category } from 'src/catalog/entities/category.entity';

@Injectable()
export class PortofolioService {
  private readonly logger = new Logger(PortofolioService.name);

  constructor(
    @InjectRepository(Portofolio)
    private readonly portfolioRepository: Repository<Portofolio>,
    @InjectRepository(PortofolioGallery)
    private readonly portfolioGalleryRepository: Repository<PortofolioGallery>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createPortfolioDto: CreatePortofolioDto, currentUserId: number, photoPaths: string[]): Promise<Portofolio> {
    try {
      this.logger.log(`[create] Creating a portfolio for user ${currentUserId}`);
      const { categoryId } = createPortfolioDto;
      
      this.logger.log(`[create] Fetching category with ID ${categoryId}`);
      const getCategory = await this.categoryRepository.findOne({ where: { id: categoryId } });

      if (!getCategory) {
        throw new BadRequestException(`Category with ID ${categoryId} not found`);
      }

      this.logger.log('[create] Creating and saving portfolio');
      const portfolio = this.portfolioRepository.create({
        ...createPortfolioDto,
        ownerId: currentUserId,
        category: getCategory
      });

      const savedPortfolio = await this.portfolioRepository.save(portfolio);

      this.logger.log('[create] Saving portfolio gallery items');
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
        relations: ['gallery', 'category'],
      });
    } catch (error) {
      this.logger.error(`[create] Failed to create portfolio: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOneById(id: number): Promise<Portofolio> {
    try {
      this.logger.log(`[findOneById] Fetching portfolio with ID ${id}`);
      const portfolio = await this.portfolioRepository.findOne({
        where: { id },
        relations: ['gallery', 'category'],
      });

      if (!portfolio) {
        throw new NotFoundException(`Portfolio with ID ${id} not found`);
      }

      return portfolio;
    } catch (error) {
      this.logger.error(`[findOneById] Failed to fetch portfolio with ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByOwner(currentUserId: number): Promise<Portofolio[]> {
    try {
      this.logger.log(`[findByOwner] Fetching portfolios for user ${currentUserId}`);
      const portfolios = await this.portfolioRepository.find({
        where: { ownerId: currentUserId },
        relations: ['gallery', 'category'],
      });

      if (!portfolios || portfolios.length === 0) {
        throw new NotFoundException(`No portfolios found for user ID ${currentUserId}`);
      }

      return portfolios;
    } catch (error) {
      this.logger.error(`[findByOwner] Failed to fetch portfolios for user ${currentUserId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
