import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFiles, InternalServerErrorException, UploadedFile, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CatalogService } from './catalog.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { extname } from 'path';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('catalog')
export class CatalogController {
    constructor(private readonly catalogService: CatalogService) {}

    @Post()
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'image_1', maxCount: 1 },
                { name: 'image_2', maxCount: 1 },
                { name: 'image_3', maxCount: 1 },
                { name: 'image_4', maxCount: 1 },
                { name: 'image_5', maxCount: 1 },
            ],
            {
                storage: diskStorage({
                    destination: './uploads/images',
                    filename: (req, file, cb) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
                    },
                }),
            },
        ),
    )
    async create(
        @Body() createCatalogDto: CreateCatalogDto,
        @UploadedFiles() files: { image_1?: Express.Multer.File[], image_2?: Express.Multer.File[], image_3?: Express.Multer.File[], image_4?: Express.Multer.File[], image_5?: Express.Multer.File[] },
    ) {
        try {          
            if (!files.image_1 || files.image_1.length === 0 || files.image_1 == undefined) {
                throw new InternalServerErrorException('No file uploaded for image_1');
            }
            
            const imageUrls = [];
            
            if (files.image_1) {
                imageUrls.push(`/uploads/images/${files.image_1[0].filename}`);
            }
            if (files.image_2 && files.image_2.length > 0) {
                imageUrls.push(`/uploads/images/${files.image_2[0].filename}`);
            }
            if (files.image_3 && files.image_3.length > 0) {
                imageUrls.push(`/uploads/images/${files.image_3[0].filename}`);
            }
            if (files.image_4 && files.image_4.length > 0) {
                imageUrls.push(`/uploads/images/${files.image_4[0].filename}`);
            }
            if (files.image_5 && files.image_5.length > 0) {
                imageUrls.push(`/uploads/images/${files.image_5[0].filename}`);
            }

            const combinedImageUrls = imageUrls.join(',');

            // Simpan URL gabungan dalam DTO
            createCatalogDto.combinedImageUrls = combinedImageUrls;

            // Simpan catalog ke database
            return await this.catalogService.create(createCatalogDto);
        } catch (error) {
            throw error
        }
    }

    @Post('review')
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: './uploads/reviews',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    async createReview(
        @Body() createReviewDto: CreateReviewDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        try {
            if (!file) {
                throw new InternalServerErrorException('No file uploaded for photo');
            }
            
            createReviewDto.photo = `/uploads/reviews/${file.filename}`;

            return await this.catalogService.createReview(createReviewDto);
        } catch (error) {
            throw error;
        }
    }

    @Get()

    async findAll(@Query('token') token: string) {
        try {
            const catalogs = await this.catalogService.findAll(token);
            return catalogs;
        } catch (error) {
            console.error('Error fetching catalogs:', error);
            throw new InternalServerErrorException('Failed to fetch catalogs');
        }
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.catalogService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.catalogService.remove(id);
    }
}

