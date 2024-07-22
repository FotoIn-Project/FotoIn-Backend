// store.controller.ts
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
  UsePipes,
  ValidationPipe,
  UploadedFile,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { extname } from 'path';
import { S3Service } from 'src/s3/s3.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.auth.guard';
import { UpdateStoreDto } from './dto/update-store.dto';

@Controller('stores')
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
    private readonly s3Service: S3Service
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('cameraPhoto', {
      storage: diskStorage({
        destination: './uploads/stores',
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
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createStoreDto: CreateStoreDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req
  ) {
    try {
      const currentUser = req.user;

      if (!file) {
        throw new InternalServerErrorException('No file uploaded for photo');
      }

      // Save combined URLs in DTO
      createStoreDto.cameraPhoto = await this.s3Service.uploadFile(file.path, file.originalname, "stores");
      createStoreDto.userId = currentUser.id

      // Save store to database
      const createdStore = await this.storeService.create(createStoreDto, currentUser.id);

      return {
        status: 200,
        message: 'Data created successfully',
        data: createdStore,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findOne(@Req() req) {
    const currentUser = req.user
    const result = await this.storeService.findOne(currentUser.id);
    return {
      status: 200,
      message: 'Get data successfully',
      data: result,
    };
  }


  @Patch()
  @UseInterceptors(
    FileInterceptor('cameraPhoto', {
      storage: diskStorage({
        destination: './uploads/stores',
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
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseGuards(JwtAuthGuard)
  async update(
    @Body() updateStoreDto: UpdateStoreDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req
  ) {
    try {
      const currentUser = req.user;

      if (!file) {
        throw new InternalServerErrorException('No file uploaded for photo');
      }

      // Save combined URLs in DTO
      updateStoreDto.cameraPhoto = await this.s3Service.uploadFile(file.path, file.originalname, "stores");
      updateStoreDto.userId = currentUser.id

      // Save store to database
      const createdStore = await this.storeService.update(currentUser.id, updateStoreDto);

      return {
        status: 200,
        message: 'Data created successfully',
        data: createdStore,
      };
    } catch (error) {
      throw error;
    }
  }

}
