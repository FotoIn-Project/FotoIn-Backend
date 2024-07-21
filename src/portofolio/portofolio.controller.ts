import { Controller, Post, UseGuards, UseInterceptors, UploadedFiles, Body, Req, UsePipes, ValidationPipe, Get, Param, Query } from '@nestjs/common';
import { PortofolioService } from './portofolio.service';
import { CreatePortofolioDto } from './dto/create-portofolio.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.auth.guard';
import { S3Service } from 'src/s3/s3.service';

@Controller('portofolio')
export class PortofolioController {
  constructor(
    private readonly portfolioService: PortofolioService,
    private readonly s3Service: S3Service,

  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('photos', 10, {
    storage: diskStorage({
      destination: './uploads/portofolio',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB
    },
  }))
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(
    @Body() createPortfolioDto: CreatePortofolioDto,
    @UploadedFiles() photos: Express.Multer.File[],
    @Req() req
  ) {
    const currentUser = req.user;

    const photoPaths = await Promise.all(
      photos.map(async (file) => {
        const uploadResult = await this.s3Service.uploadFile(file.path, file.originalname, "portofolio");
        return uploadResult;
      })
    );

    const result = await this.portfolioService.create(createPortfolioDto, currentUser.id, photoPaths);
    return {
      status: 200,
      message: 'Data created successfully',
      data: result,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getPortfolioById(@Query('id') id: number) {
    const result = await this.portfolioService.findOneById(id);
    return {
      status: 200,
      message: 'Get data successfully',
      data: result,
    };
  }

  @Get('owner')
  @UseGuards(JwtAuthGuard)
  async getPortfoliosByOwner(@Req() req) {
    const currentUser = req.user;
    const result = await this.portfolioService.findByOwner(currentUser.id);
    return {
      status: 200,
      count: result.length,
      message: 'Get data successfully',
      data: result,
    };
  }
}
