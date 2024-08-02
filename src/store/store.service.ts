import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);

  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  async create(createStoreDto: CreateStoreDto, userId: number): Promise<Store> {
    try {
      this.logger.log(`[create] Creating a store for user ${userId}`);

      this.logger.log(`[create] Checking if store exists for user ${userId}`);
      const getStoreByUserId = await this.storeRepository.findOne({ where: { userId } });
      if (getStoreByUserId) {
        throw new HttpException('Store already exist', HttpStatus.CONFLICT);
      }

      this.logger.log('[create] Creating and saving store');
      const store = this.storeRepository.create(createStoreDto);
      return this.storeRepository.save(store);
    } catch (error) {
      this.logger.error(`[create] Failed to create store for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(userId: number): Promise<Store> {
    try {
      this.logger.log(`[findOne] Fetching store for user ${userId}`);
      const store = await this.storeRepository.findOne({ where: { userId } });
      if (!store) {
        throw new HttpException('Store not found', HttpStatus.NOT_FOUND);
      }
      return store;
    } catch (error) {
      this.logger.error(`[findOne] Failed to fetch store for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: number, updateStoreDto: Partial<CreateStoreDto>): Promise<Store> {
    try {
      this.logger.log(`[update] Updating store with ID ${id}`);
      await this.storeRepository.update(id, updateStoreDto);
      return this.findOne(id);
    } catch (error) {
      this.logger.error(`[update] Failed to update store with ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
