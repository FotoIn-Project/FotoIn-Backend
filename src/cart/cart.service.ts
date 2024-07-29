import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart.entity';
import { CreateCartItemDto, CartItemType } from './dto/create-cart.dto';
import { User } from 'src/users/entities/user.entity';
import { Catalog } from 'src/catalog/entities/catalog.entity';
import { UpdateCartItemDto } from './dto/update-cart.dto';


@Injectable()
export class CartService {
    constructor(
        @InjectRepository(CartItem)
        private cartRepository: Repository<CartItem>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Catalog)
        private catalogRepository: Repository<Catalog>,
    ) {}

    async create(createCartItemDto: CreateCartItemDto, currentUserId: number): Promise<CartItem> {
        const { catalogId, type } = createCartItemDto;

        const user = await this.userRepository.findOne({where: {id: currentUserId}});
        const catalog = await this.catalogRepository.findOne({where: {id: catalogId}});

        if (!user || !catalog ) {
            throw new Error('User, Catalog, or CreatedBy not found');
        }

        const cartItem = this.cartRepository.create({ user, catalog, type, created_by: user.email });
        return this.cartRepository.save(cartItem);
    }

    async delete(id: number, currentUserId: number): Promise<void> {
        const updatedBy = await this.userRepository.findOne({where: {id: currentUserId}});
        if (!updatedBy) {
            throw new Error('UpdatedBy user not found');
        }
        await this.cartRepository.update(id, { statusData: false, updated_by: updatedBy.email });
    }

    async updateType(id: number, updateCartItemDto: UpdateCartItemDto, currentUserId: number): Promise<CartItem> {
        const updatedBy = await this.userRepository.findOne({where: {id: currentUserId}});
        if (!updatedBy) {
            throw new Error('UpdatedBy user not found');
        }
        await this.cartRepository.update(id, { ...updateCartItemDto, updated_by: updatedBy.email });
        return this.cartRepository.findOne({where: {id}});
    }

    async findAllByTypeAndUserId(type?: CartItemType, userId?: number): Promise<CartItem[]> {
        const query = this.cartRepository.createQueryBuilder('cartItem')
            .leftJoinAndSelect('cartItem.user', 'user')
            .leftJoinAndSelect('cartItem.catalog', 'catalog')
            .where('cartItem.statusData = :statusData', { statusData: true });

        if (type !== undefined) {
            query.andWhere('cartItem.type = :type', { type });
        }

        if (userId !== undefined) {
            query.andWhere('user.id = :userId', { userId });
        }

        return query.getMany();
    }
}
