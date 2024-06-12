import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Catalog } from './entities/catalog.entity';
import { CatalogGallery } from './entities/catalog-gallery.entity';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { Category } from './entities/category.entity';
import { JwtService } from 'src/utils/jwt/jwt.service';
import { HttpStatus } from '@nestjs/common/enums';
import { ProfileUser } from 'src/profile-user/entities/profile-user.entity';

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

        private readonly jwtService : JwtService
    ) {}

    async create(createCatalogDto: CreateCatalogDto): Promise<Catalog> {
        try {
            const { token } = createCatalogDto;
            const decoded = await this.jwtService.verifyJwtToken(token);

            const catalog = new Catalog();
            catalog.title = createCatalogDto.title;
            catalog.price = createCatalogDto.price;
            catalog.description = createCatalogDto.description;
            catalog.tags = createCatalogDto.tags;
            catalog.availableDate = createCatalogDto.availableDate;
            catalog.location = createCatalogDto.location;
            catalog.ownerId = decoded.userId;

            // Set category if categoryId is provided
            console.log(createCatalogDto.categoryId);
            
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

    async findAll(): Promise<any[]> {
        const catalogs = await this.catalogRepository.find({ relations: ['gallery', 'category'] });
        const results = await Promise.all(catalogs.map(async (catalog) => {
            const profile = await this.profileUserRepository.findOne({ where: { user: { id: catalog.ownerId } } });
            return {
                ...catalog,
                owner: {
                    userId : catalog.ownerId,
                    company_name : profile ? profile.company_name : null,
                } 
            };
        }));
    
        return results;
    }

    async findOne(id: number): Promise<Catalog> {
        return this.catalogRepository.findOne({
            where: { id },
            relations: ['gallery', 'category'],
        });
    }

    async remove(id: number): Promise<void> {
        await this.catalogRepository.delete(id);
    }
}
