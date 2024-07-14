import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Catalog } from './entities/catalog.entity';
import { CatalogGallery } from './entities/catalog-gallery.entity';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { Category } from './entities/category.entity';
import { HttpStatus } from '@nestjs/common/enums';
import { ProfileUser } from 'src/profile-user/entities/profile-user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CatalogService {
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

    ) {}

    async create(createCatalogDto: CreateCatalogDto, currentUserId: number): Promise<Catalog> {
        try {
            const catalog = new Catalog();
            catalog.title = createCatalogDto.title;
            catalog.price = createCatalogDto.price;
            catalog.description = createCatalogDto.description;
            catalog.tags = createCatalogDto.tags;
            catalog.availableDate = createCatalogDto.availableDate;
            catalog.location = createCatalogDto.location;            
            catalog.ownerId = currentUserId;
            
            if (createCatalogDto.categoryId) {
                const category = await this.categoryRepository.findOne({ where: { id: createCatalogDto.categoryId } });  
                if (!category) {
                    throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
                }
                catalog.category = category;
            }

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
            throw error
        }
    }

    async createReview(createReviewDto: CreateReviewDto, currentUserId: number): Promise<Review> {
        const { rating, text, photo, catalogId } = createReviewDto;

        // Find the catalog by ID
        const catalog = await this.catalogRepository.findOne({ where: { id: catalogId } });
        if (!catalog) {
            throw new HttpException('Catalog not found', HttpStatus.NOT_FOUND);
        }

        // Find the reviewer by decoded user ID
        const reviewer = await this.profileUserRepository.findOne({ where: { user: { id: currentUserId } } });
        if (!reviewer) {
            throw new HttpException('Reviewer not found', HttpStatus.NOT_FOUND);
        }

        // Create the review
        const review = new Review();
        review.rating = rating;
        review.text = text;
        review.photo = photo;
        review.catalog = catalog;
        review.reviewer = reviewer;

        // Save the review to the repository
        return this.reviewRepository.save(review);
    }

    async findAll(): Promise<any[]> {
        const catalogs = await this.catalogRepository.find({
          where: { statusData: true },
          relations: ['gallery', 'category', 'reviews', 'reviews.reviewer'],
        });
    
        const results = await Promise.all(catalogs.map(async (catalog) => {
          return await this.mapCatalogWithReviewsAndProfile(catalog);
        }));
    
        return results;
      }

    async findbyOwner(ownerId: number): Promise<any[]> {
        const catalogs = await this.catalogRepository.find({
          where: { ownerId, statusData: true },
          relations: ['gallery', 'category', 'reviews', 'reviews.reviewer'],
        });
    
        const results = await Promise.all(catalogs.map(async (catalog) => {
          return await this.mapCatalogWithReviewsAndProfile(catalog);
        }));
    
        return results;
      }

    async findOne(id: number): Promise<any> {
        const catalog = await this.catalogRepository.findOne({
          where: { id },
          relations: ['gallery', 'category', 'reviews', 'reviews.reviewer'],
        });
    
        if (!catalog) {
          throw new InternalServerErrorException('Catalog not found');
        }
    
        return await this.mapCatalogWithReviewsAndProfile(catalog);
      }
    
    async remove(id: number): Promise<void> {
        const catalog = await this.catalogRepository.findOne({ where: { id } });
        if (!catalog) {
            throw new HttpException('Catalog not found', HttpStatus.NOT_FOUND);
        }

        catalog.statusData = false;
        await this.catalogRepository.save(catalog);
    }

    async findByCategory(categoryId: number): Promise<any[]> {
      const catalogs = await this.catalogRepository.find({
        where: { category: { id: categoryId }, statusData: true },
        relations: ['gallery', 'category', 'reviews', 'reviews.reviewer'],
      });
  
      const results = await Promise.all(catalogs.map(async (catalog) => {
        return await this.mapCatalogWithReviewsAndProfile(catalog);
      }));
  
      return results;
    }

    private async mapCatalogWithReviewsAndProfile(catalog: Catalog): Promise<any> {
        const profile = await this.profileUserRepository.findOne({ where: { user: { id: catalog.ownerId } } });
    
        const averageRating = catalog.reviews.length > 0 
          ? catalog.reviews.reduce((sum, review) => sum + review.rating, 0) / catalog.reviews.length 
          : 0;
    
        return {
          ...catalog,
          owner: {
            userId: catalog.ownerId,
            company_name: profile ? profile.company_name : null,
          },
          averageRating: averageRating.toFixed(2), // Rounded to two decimal places
        };
      }
}
