import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { WalletTransaction } from './entities/wallet.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { S3Service } from 'src/s3/s3.service';
import { Catalog } from 'src/catalog/entities/catalog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, WalletTransaction, Catalog])],
  controllers: [WalletController],
  providers: [WalletService, S3Service],
})
export class WalletModule {}
