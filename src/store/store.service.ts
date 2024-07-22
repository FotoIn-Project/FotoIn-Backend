// store.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

    async create(createStoreDto: CreateStoreDto, userId : number): Promise<Store> {
        const getStoreByUserId = this.storeRepository.find({where : {userId}})
        if (getStoreByUserId) {
            throw new HttpException('Store already exist', HttpStatus.CONFLICT);
        }
        const store = this.storeRepository.create(createStoreDto);
        return this.storeRepository.save(store);
    }

    async findOne(userId: number): Promise<Store> {
        return this.storeRepository.findOne({ where : {userId}});
    }

    async update(id: number, updateStoreDto: Partial<CreateStoreDto>): Promise<Store> {
        await this.storeRepository.update(id, updateStoreDto);
        return this.findOne(id);
    }

}
