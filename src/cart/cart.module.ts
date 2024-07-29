import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartItem } from './entities/cart.entity';
import { User } from 'src/users/entities/user.entity';
import { Catalog } from 'src/catalog/entities/catalog.entity';
@Module({
    imports: [TypeOrmModule.forFeature([CartItem, User, Catalog])],
    providers: [CartService],
    controllers: [CartController],
})
export class CartModule {}
