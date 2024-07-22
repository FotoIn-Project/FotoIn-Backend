// store.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { S3Service } from 'src/s3/s3.service';

@Module({
    imports: [TypeOrmModule.forFeature([Store])],
    providers: [StoreService, S3Service],
    controllers: [StoreController],
})
export class StoreModule {}
