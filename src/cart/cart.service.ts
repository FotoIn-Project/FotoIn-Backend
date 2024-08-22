import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart.entity';
import { CreateCartItemDto, CartItemType } from './dto/create-cart.dto';
import { User } from 'src/users/entities/user.entity';
import { Catalog } from 'src/catalog/entities/catalog.entity';
import { UpdateCartItemDto } from './dto/update-cart.dto';
import { Store } from 'src/store/entities/store.entity';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Catalog)
    private catalogRepository: Repository<Catalog>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  async create(createCartItemDto: CreateCartItemDto, currentUserId: number): Promise<CartItem> {
    try {
      this.logger.log(`[create] Creating a cart item for user ${currentUserId}`);
      const { catalogId, type } = createCartItemDto;

      this.logger.log(`[create] Fetching user with ID ${currentUserId}`);
      const user = await this.userRepository.findOne({ where: { id: currentUserId } });

      this.logger.log(`[create] Fetching catalog with ID ${catalogId}`);
      const catalog = await this.catalogRepository.findOne({ where: { id: catalogId } });

      if (!user || !catalog) {
        throw new Error('User, Catalog, or CreatedBy not found');
      }

      this.logger.log('[create] Creating and saving cart item');
      const cartItem = this.cartRepository.create({ user, catalog, type, created_by: user.email });
      return this.cartRepository.save(cartItem);
    } catch (error) {
      this.logger.error(`[create] Failed to create cart item: ${error.message}`, error.stack);
      throw error;
    }
  }

  async delete(id: number, currentUserId: number): Promise<void> {
    try {
      this.logger.log(`[delete] Deleting cart item with ID ${id} for user ${currentUserId}`);
      const updatedBy = await this.userRepository.findOne({ where: { id: currentUserId } });
      if (!updatedBy) {
        throw new Error('UpdatedBy user not found');
      }
      await this.cartRepository.update(id, { statusData: false, updated_by: updatedBy.email });
    } catch (error) {
      this.logger.error(`[delete] Failed to delete cart item with ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateType(id: number, updateCartItemDto: UpdateCartItemDto, currentUserId: number): Promise<CartItem> {
    try {
      this.logger.log(`[updateType] Updating type of cart item with ID ${id} for user ${currentUserId}`);
      const updatedBy = await this.userRepository.findOne({ where: { id: currentUserId } });
      if (!updatedBy) {
        throw new Error('UpdatedBy user not found');
      }
      await this.cartRepository.update(id, { ...updateCartItemDto, updated_by: updatedBy.email });
      return this.cartRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(`[updateType] Failed to update type of cart item with ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAllByTypeAndUserId(type?: CartItemType, userId?: number): Promise<any> {
    try {
      this.logger.log(`[findAllByTypeAndUserId] Fetching cart items with type ${type} for user ${userId}`);
      
      const query = this.cartRepository.createQueryBuilder('cartItem')
        .leftJoinAndSelect('cartItem.user', 'user')
        .leftJoinAndSelect('cartItem.catalog', 'catalog')
        .leftJoinAndSelect('catalog.gallery', 'catalogGallery')  // Join catalog gallery
        .leftJoinAndSelect('catalog.category', 'catalogCategory')  // Join category from catalog
        .where('cartItem.statusData = :statusData', { statusData: true });
  
      if (type !== undefined) {
        query.andWhere('cartItem.type = :type', { type });
      }
  
      if (userId !== undefined) {
        query.andWhere('user.id = :userId', { userId });
      }
  
      const cartItems = await query.getMany();
  
      console.log(cartItems);
      
      // Optional: You can map the cart items to include formatted gallery data if needed
      const cartItemsWithGalleryAndOwner = await Promise.all(
        cartItems.map(async (cartItem) => {
          const owner = await this.storeRepository.findOne({ where: { userId: cartItem.user.id } });
          return {
            ...cartItem,
            owner
          };
        })
      );
  
  
      return cartItemsWithGalleryAndOwner;
    } catch (error) {
      this.logger.error(`[findAllByTypeAndUserId] Failed to fetch cart items: ${error.message}`, error.stack);
      throw error;
    }
  }
  
}
