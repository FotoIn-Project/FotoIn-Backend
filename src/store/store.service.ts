// store.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoreService {
    constructor(
        @InjectRepository(Store)
        private storeRepository: Repository<Store>,
    ) {}

    async create(createStoreDto: CreateStoreDto): Promise<Store> {
        const store = this.storeRepository.create(createStoreDto);
        return this.storeRepository.save(store);
    }

    async findAll(): Promise<Store[]> {
        return this.storeRepository.find();
    }

    async findOne(id: number): Promise<Store> {
        return this.storeRepository.findOneBy({ id });
    }

    async update(id: number, updateStoreDto: Partial<CreateStoreDto>): Promise<Store> {
        await this.storeRepository.update(id, updateStoreDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.storeRepository.delete(id);
    }
}
