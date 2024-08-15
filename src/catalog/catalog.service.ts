import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Catalog } from './entities/catalog.entity';
import { CatalogGallery } from './entities/catalog-gallery.entity';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { Category } from './entities/category.entity';
import { HttpStatus } from '@nestjs/common/enums';
import { ProfileUser } from 'src/profile-user/entities/profile-user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';
import { Portofolio } from 'src/portofolio/entities/portofolio.entity';
import { Store } from 'src/store/entities/store.entity';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    @InjectRepository(Catalog)
    private catalogRepository: Repository<Catalog>,
    @InjectRepository(CatalogGallery)
    private catalogGalleryRepository: Repository<CatalogGallery>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(ProfileUser)
    private profileUserRepository: Repository<ProfileUser>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Portofolio)
    private portofolioRepository: Repository<Portofolio>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,

  ) {}

  async create(
    createCatalogDto: CreateCatalogDto,
    currentUserId: number,
  ): Promise<Catalog> {
    try {
      this.logger.log(`[create] Creating a catalog for user ${currentUserId}`);
      const catalog = new Catalog();
      catalog.title = createCatalogDto.title;
      catalog.price = createCatalogDto.price;
      catalog.description = createCatalogDto.description;
      catalog.availableDate = createCatalogDto.availableDate;
      catalog.location = createCatalogDto.location;
      catalog.ownerId = currentUserId;

      if (createCatalogDto.categoryId) {
        this.logger.log(`[create] Fetching category with ID ${createCatalogDto.categoryId}`);
        const category = await this.categoryRepository.findOne({
          where: { id: createCatalogDto.categoryId },
        });
        if (!category) {
          throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }
        catalog.category = category;
      }

      if (createCatalogDto.portofolioId) {
        this.logger.log(`[create] Fetching portfolio with ID ${createCatalogDto.portofolioId}`);
        const portofolio = await this.portofolioRepository.findOne({
          where: { id: createCatalogDto.portofolioId },
        });
        if (!portofolio) {
          throw new HttpException('Portofolio not found', HttpStatus.NOT_FOUND);
        }
        catalog.portofolio = portofolio;
      }

      this.logger.log('[create] Saving the catalog');
      const savedCatalog = await this.catalogRepository.save(catalog);

      const imageUrls = createCatalogDto.combinedImageUrls.split(',');
      for (const imageUrl of imageUrls) {
        const gallery = new CatalogGallery();
        gallery.imageUrl = imageUrl;
        gallery.catalog = savedCatalog;
        await this.catalogGalleryRepository.save(gallery);
      }

      return savedCatalog;
    } catch (error) {
      this.logger.error(`[create] Failed to create catalog: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createReview(
    createReviewDto: CreateReviewDto,
    currentUserId: number,
  ): Promise<Review> {
    try {
      this.logger.log(`[createReview] Creating a review for catalog ${createReviewDto.catalogId} by user ${currentUserId}`);
      const { rating, text, photo, catalogId } = createReviewDto;

      const catalog = await this.catalogRepository.findOne({
        where: { id: catalogId },
      });
      if (!catalog) {
        throw new HttpException('Catalog not found', HttpStatus.NOT_FOUND);
      }

      const reviewer = await this.profileUserRepository.findOne({
        where: { user: { id: currentUserId } },
      });
      if (!reviewer) {
        throw new HttpException('Reviewer not found', HttpStatus.NOT_FOUND);
      }

      const review = new Review();
      review.rating = rating;
      review.text = text;
      review.photo = photo;
      review.catalog = catalog;
      review.reviewer = reviewer;

      this.logger.log('[createReview] Saving the review');
      return this.reviewRepository.save(review);
    } catch (error) {
      this.logger.error(`[createReview] Failed to create review: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<any[]> {
    try {
      this.logger.log('[findAll] Fetching all catalogs');
      const catalogs = await this.catalogRepository.find({
        where: { statusData: true },
        relations: ['gallery', 'category', 'reviews', 'reviews.reviewer', 'portofolio', 'portofolio.gallery'],
      });

      const results = await Promise.all(
        catalogs.map(async (catalog) => {
          return await this.mapCatalogWithReviewsAndProfile(catalog);
        }),
      );

      return results;
    } catch (error) {
      this.logger.error(`[findAll] Failed to fetch all catalogs: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findbyOwner(ownerId: number): Promise<any[]> {
    try {
      this.logger.log(`[findbyOwner] Fetching catalogs for owner ${ownerId}`);
      const catalogs = await this.catalogRepository.find({
        where: { ownerId, statusData: true },
        relations: ['gallery', 'category', 'reviews', 'reviews.reviewer',  'portofolio', 'portofolio.gallery'],
      });

      const results = await Promise.all(
        catalogs.map(async (catalog) => {
          return await this.mapCatalogWithReviewsAndProfile(catalog);
        }),
      );

      return results;
    } catch (error) {
      this.logger.error(`[findbyOwner] Failed to fetch catalogs for owner ${ownerId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      this.logger.log(`[findOne] Fetching catalog with ID ${id}`);
      const catalog = await this.catalogRepository.findOne({
        where: { id },
        relations: ['gallery', 'category', 'reviews', 'reviews.reviewer',  'portofolio', 'portofolio.gallery'],
      });

      if (!catalog) {
        throw new InternalServerErrorException('Catalog not found');
      }

      return await this.mapCatalogWithReviewsAndProfile(catalog);
    } catch (error) {
      this.logger.error(`[findOne] Failed to fetch catalog with ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      this.logger.log(`[remove] Removing catalog with ID ${id}`);
      const catalog = await this.catalogRepository.findOne({ where: { id } });
      if (!catalog) {
        throw new HttpException('Catalog not found', HttpStatus.NOT_FOUND);
      }

      catalog.statusData = false;
      await this.catalogRepository.save(catalog);
    } catch (error) {
      this.logger.error(`[remove] Failed to remove catalog with ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findBySearchAndCategory(categoryId: number, search: string): Promise<any[]> {
    try {
      this.logger.log(`[findBySearchAndCategory] Searching catalogs with category ID ${categoryId} and search term ${search}`);
      const query = this.catalogRepository.createQueryBuilder('catalog')
        .leftJoinAndSelect('catalog.gallery', 'gallery')
        .leftJoinAndSelect('catalog.category', 'category')
        .leftJoinAndSelect('catalog.reviews', 'reviews')
        .leftJoinAndSelect('reviews.reviewer', 'reviewer')
        .leftJoinAndSelect('catalog.portofolio', 'portofolio')
        .leftJoinAndSelect('portofolio.gallery', 'portofolioGallery')
        .where('catalog.statusData = :statusData', { statusData: true });

      if (search) {
        query.andWhere(
          '(catalog.title LIKE :search OR catalog.location LIKE :search)',
          { search: `%${search}%` }
        );
      }

      if (categoryId) {
        query.andWhere('catalog.categoryId = :categoryId', { categoryId });
      }

      const catalogs = await query.getMany();

      const results = await Promise.all(
        catalogs.map(async (catalog) => {
          return await this.mapCatalogWithReviewsAndProfile(catalog);
        }),
      );

      return results;
    } catch (error) {
      this.logger.error(`[findBySearchAndCategory] Failed to search catalogs with category ID ${categoryId} and search term ${search}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findTopRecommendedByCategory(categoryId: number): Promise<any[]> {
    try {
      this.logger.log(`[findTopRecommendedByCategory] Fetching top recommended catalogs for category ID ${categoryId}`);
      const catalogs = await this.catalogRepository.find({
        where: { category: { id: categoryId }, statusData: true },
        relations: ['gallery', 'category', 'reviews', 'portofolio', 'portofolio.gallery'],
      });

      if (!catalogs.length) {
        throw new HttpException(
          'No catalogs found in this category',
          HttpStatus.NOT_FOUND,
        );
      }

      const results = await Promise.all(
        catalogs.map(async (catalog) => {
          return await this.mapCatalogWithReviewsAndProfile(catalog);
        }),
      );

      results.sort((a, b) => b.averageRating - a.averageRating);

      return results.slice(0, 10);
    } catch (error) {
      this.logger.error(`[findTopRecommendedByCategory] Failed to fetch top recommended catalogs for category ID ${categoryId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async mapCatalogWithReviewsAndProfile(
    catalog: Catalog,
  ): Promise<any> {
    this.logger.log(`[mapCatalogWithReviewsAndProfile] Mapping catalog with ID ${catalog.id} with reviews and profile`);
    const store = await this.storeRepository.findOne({
      where: { userId : catalog.ownerId },
    });

    const averageRating =
      catalog.reviews.length > 0
        ? catalog.reviews.reduce((sum, review) => sum + review.rating, 0) /
          catalog.reviews.length
        : 0;

    return {
      ...catalog,
      owner: {
        userId: catalog.ownerId,
        company_name: store ? store.companyName : null,
      },
      averageRating: averageRating.toFixed(2),
    };
  }

  async findAllCategory(): Promise<Category[]> {
    this.logger.log('[findAllCategory] Fetching all categories');
    return await this.categoryRepository.find();
  }
}
