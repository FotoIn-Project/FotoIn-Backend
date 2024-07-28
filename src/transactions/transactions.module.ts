// src/transactions/transactions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './entities/transactions.entity';
import {Catalog} from 'src/catalog/entities/catalog.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Catalog, User])],
  providers: [TransactionsService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
