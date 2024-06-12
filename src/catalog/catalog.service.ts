// // // import { Injectable, InternalServerErrorException } from '@nestjs/common';
// // // import { InjectRepository } from '@nestjs/typeorm';
// // // import { Repository } from 'typeorm';
// // // import { Catalog } from './entities/catalog.entity';
// // // import { CatalogGallery } from './entities/catalog-gallery.entity';
// // // import { CreateCatalogDto } from './dto/create-catalog.dto';

// // // @Injectable()
// // // export class CatalogService {
// // //     constructor(
// // //         @InjectRepository(Catalog)
// // //         private catalogRepository: Repository<Catalog>,
// // //         @InjectRepository(CatalogGallery)
// // //         private catalogGalleryRepository: Repository<CatalogGallery>,
// // //     ) {}

// // //     async create(createCatalogDto: CreateCatalogDto): Promise<Catalog> {
// // //         try {
// // //           const catalog = new Catalog();
// // //           catalog.title = createCatalogDto.title;
// // //           catalog.price = createCatalogDto.price;
// // //           catalog.description = createCatalogDto.description;
// // //           catalog.banner = createCatalogDto.banner;
// // //           catalog.tags = createCatalogDto.tags;
// // //           catalog.availableDate = createCatalogDto.availableDate;
// // //           catalog.location = createCatalogDto.location;
    
// // //           const savedCatalog = await this.catalogRepository.save(catalog);
    
// // //           for (const imageUrl of createCatalogDto.gallery) {
// // //             const gallery = new CatalogGallery();
// // //             gallery.imageUrl = imageUrl;
// // //             gallery.catalog = savedCatalog;
// // //             await this.catalogGalleryRepository.save(gallery);
// // //           }
    
// // //           return savedCatalog;
// // //         } catch (error) {
// // //           console.error('Error creating catalog:', error);
// // //           throw new InternalServerErrorException('Failed to create catalog');
// // //         }
// // //     }

// // //     async findAll(): Promise<Catalog[]> {
// // //         return this.catalogRepository.find({ relations: ['gallery'] });
// // //     }

// // //     async findOne(id: number): Promise<Catalog> {
// // //         // return this.catalogRepository.findOne(id, { relations: ['gallery'] });
// // //         // return this.catalogRepository.findOne({where : {id}});
// // //         return this.catalogRepository.findOne({
// // //             where: { id },
// // //             relations: ['gallery'],
// // //         });
// // //     }

// // //     async remove(id: number): Promise<void> {
// // //         await this.catalogRepository.delete(id);
// // //     }
// // // }


// // import { Injectable, InternalServerErrorException } from '@nestjs/common';
// // import { InjectRepository } from '@nestjs/typeorm';
// // import { Repository } from 'typeorm';
// // import { Catalog } from './entities/catalog.entity';
// // import { CreateCatalogDto } from './dto/create-catalog.dto';

// // @Injectable()
// // export class CatalogService {
// //     constructor(
// //         @InjectRepository(Catalog)
// //         private catalogRepository: Repository<Catalog>,
// //     ) {}

// //     async create(createCatalogDto: CreateCatalogDto): Promise<Catalog> {
// //         try {
// //             const catalog = new Catalog();
// //             catalog.title = createCatalogDto.title;
// //             catalog.price = createCatalogDto.price;
// //             catalog.description = createCatalogDto.description;
// //             catalog.tags = createCatalogDto.tags;
// //             catalog.availableDate = createCatalogDto.availableDate;
// //             catalog.location = createCatalogDto.location;
// //             catalog.combined_image_urls = createCatalogDto.combinedImageUrls;

// //             return await this.catalogRepository.save(catalog);
// //         } catch (error) {
// //             console.error('Error creating catalog:', error);
// //             throw new InternalServerErrorException('Failed to create catalog');
// //         }
// //     }

// //     async findAll(): Promise<Catalog[]> {
// //         return this.catalogRepository.find();
// //     }

// //     async findOne(id: number): Promise<Catalog> {
// //         return this.catalogRepository.findOne({
// //             where: { id },
// //         });
// //     }

// //     async remove(id: number): Promise<void> {
// //         await this.catalogRepository.delete(id);
// //     }
// // }

// import { Injectable, InternalServerErrorException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Catalog } from './entities/catalog.entity';
// import { CatalogGallery } from './entities/catalog-gallery.entity';
// import { CreateCatalogDto } from './dto/create-catalog.dto';
// import { Category } from './entities/category.entity';

// @Injectable()
// export class CatalogService {
//     constructor(
//         @InjectRepository(Catalog)
//         private catalogRepository: Repository<Catalog>,
//         @InjectRepository(CatalogGallery)
//         private catalogGalleryRepository: Repository<CatalogGallery>,

//         @InjectRepository(Category)
//         private categoryRepository: Repository<Category>,
//     ) {}

//     async create(createCatalogDto: CreateCatalogDto): Promise<Catalog> {
//         try {
//             const catalog = new Catalog();
//             catalog.title = createCatalogDto.title;
//             catalog.price = createCatalogDto.price;
//             catalog.description = createCatalogDto.description;
//             catalog.tags = createCatalogDto.tags;
//             catalog.availableDate = createCatalogDto.availableDate;
//             catalog.location = createCatalogDto.location;

//              // Set category if categoryId is provided
//              if (createCatalogDto.categoryId) {
//                 const category = await this.categoryRepository.findOne({ where: { id: createCatalogDto.categoryId } });
//                 if (category) {
//                     catalog.category = category;
//                 }
//             }

//             const savedCatalog = await this.catalogRepository.save(catalog);
//             console.log(createCatalogDto.combinedImageUrls);
            

//             const imageUrls = createCatalogDto.combinedImageUrls.split(',');
//             for (const imageUrl of imageUrls) {
//                 const gallery = new CatalogGallery();
//                 gallery.imageUrl = imageUrl;
//                 gallery.catalog = savedCatalog;
//                 console.log(gallery);
//                 await this.catalogGalleryRepository.save(gallery);
//             }

//             return savedCatalog;
//         } catch (error) {
//             console.error('Error creating catalog:', error);
//             throw new InternalServerErrorException('Failed to create catalog');
//         }
//     }

//     async findAll(): Promise<Catalog[]> {
//         return this.catalogRepository.find({ relations: ['gallery'] });
//     }

//     async findOne(id: number): Promise<Catalog> {
//         return this.catalogRepository.findOne({
//             where: { id },
//             relations: ['gallery'],
//         });
//     }

//     async remove(id: number): Promise<void> {
//         await this.catalogRepository.delete(id);
//     }
// }

import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Catalog } from './entities/catalog.entity';
import { CatalogGallery } from './entities/catalog-gallery.entity';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { Category } from './entities/category.entity';
import { JwtService } from 'src/utils/jwt/jwt.service';
import { HttpStatus } from '@nestjs/common/enums';

@Injectable()
export class CatalogService {
    constructor(
        @InjectRepository(Catalog)
        private catalogRepository: Repository<Catalog>,
        @InjectRepository(CatalogGallery)
        private catalogGalleryRepository: Repository<CatalogGallery>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
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

    async findAll(): Promise<Catalog[]> {
        return this.catalogRepository.find({ relations: ['gallery', 'category'] });
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
