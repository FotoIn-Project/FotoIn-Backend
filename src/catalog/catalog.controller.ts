import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  InternalServerErrorException,
  UploadedFile,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CatalogService } from './catalog.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { extname } from 'path';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.auth.guard';
import { S3Service } from 'src/s3/s3.service';
@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'uploads', maxCount: 10 }],
      {
        storage: diskStorage({
          destination: './uploads/catalog',
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
          },
        }),
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
      },
    ),
  )
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(
    @Body() createCatalogDto: CreateCatalogDto,
    @UploadedFiles() files: { uploads?: Express.Multer.File[] },
    @Req() req,
  ) {
    try {
      const currentUser = req.user;
      if (!files.uploads || files.uploads.length === 0) {
        throw new InternalServerErrorException('No files uploaded');
      }

      const uploadPromises = files.uploads.map(
        (file) => this.s3Service.uploadFile(file.path, file.originalname, "catalog"), // Upload to S3
      );

      const fileUrls = await Promise.all(uploadPromises);

      const combinedImageUrls = fileUrls.join(',');

      // Save combined URLs in DTO
      createCatalogDto.combinedImageUrls = combinedImageUrls;

      // Save catalog to database
      const result = await this.catalogService.create(
        createCatalogDto,
        currentUser.id,
      );
      return {
        statusCode: 200,
        message: 'Catalog created successfully',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('review')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/reviews',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    try {
      const currentUser = req.user;
      if (!file) {
        throw new InternalServerErrorException('No file uploaded for photo');
      }

      createReviewDto.photo = await this.s3Service.uploadFile(file.path, file.originalname, "review");

      const result = await this.catalogService.createReview(
        createReviewDto,
        currentUser.id,
      );
      return {
        statusCode: 200,
        message: 'Review created successfully',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req) {
    try {
      const result = await this.catalogService.findAll();
      return {
        statusCode: 200,
        message: 'Catalogs retrieved successfully',
        count: result.length,
        data: result,
      };
    } catch (error) {
      console.error('Error fetching catalogs:', error);
      throw new InternalServerErrorException('Failed to fetch catalogs');
    }
  }

  @Get('owner')
  @UseGuards(JwtAuthGuard)
  async findByUserId(@Req() req) {
    const currentUser = req.user;
    const result = await this.catalogService.findbyOwner(currentUser.id);
    return {
      statusCode: 200,
      message: 'Catalogs retrieved successfully',
      count: result.length,
      data: result,
    };
  }

  @Get('category')
  @UseGuards(JwtAuthGuard)
  async findAllCategory() {
    try {
      const result = await this.catalogService.findAllCategory();
      return {
        statusCode: 200,
        message: 'Categories retrieved successfully',
        count: result.length,
        data: result,
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: number) {
    const result = await this.catalogService.findOne(id);
    return {
      statusCode: 200,
      message: 'Catalog retrieved successfully',
      data: result,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number) {
    try {
      await this.catalogService.remove(id);
      return {
        statusCode: 200,
        message: 'Catalog deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting catalog:', error);
      throw new InternalServerErrorException('Failed to delete catalog');
    }
  }

  @Get('category/:categoryId')
  @UseGuards(JwtAuthGuard)
  async findByCategory(@Param('categoryId') categoryId: number) {
    try {
      const result = await this.catalogService.findByCategory(categoryId);
      return {
        statusCode: 200,
        message: 'Catalogs retrieved successfully',
        count: result.length,
        data: result,
      };
    } catch (error) {
      console.error('Error fetching catalogs by category:', error);
      throw new InternalServerErrorException(
        'Failed to fetch catalogs by category',
      );
    }
  }

  @Get('category/top-recommendation/:categoryId')
  @UseGuards(JwtAuthGuard)
  async findTopRecommendedByCategory(@Param('categoryId') categoryId: number) {
    try {
      const result = await this.catalogService.findTopRecommendedByCategory(categoryId);
      return {
        statusCode: 200,
        message: 'Top recommended catalog retrieved successfully',
        count : result.length,
        data: result,
      };
    } catch (error) {
      console.error('Error fetching top recommended catalog:', error);
      throw new InternalServerErrorException('Failed to fetch top recommended catalog');
    }
  }
}
