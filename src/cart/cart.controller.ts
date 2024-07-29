import { Controller, Post, Body, Delete, Param, Patch, Get, Query, UsePipes, UseGuards, ValidationPipe, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto, CartItemType } from './dto/create-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.auth.guard';

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async create(@Body() createCartItemDto: CreateCartItemDto, @Req() req): Promise<any> {
      const currentUser = req.user;
        const result = await this.cartService.create(createCartItemDto, currentUser.id);
        return {
          message: 'Data has been created successfully',
          data: result
        }
    }

    @Delete()
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async delete(@Query('id') id: number, @Req() req): Promise<any> {
      const currentUser = req.user;
        const result = await this.cartService.delete(id, currentUser.id);
        return {
          message: 'Data has been deleted successfully',
          data: result
        }
    }

    @Patch()
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async updateType(@Query('id') id: number, @Body() updateCartItemDto: UpdateCartItemDto, @Req() req): Promise<any> {
      const currentUser = req.user;
        const result = await this.cartService.updateType(id, updateCartItemDto, currentUser.id);
        return {
          message: 'Data has been updated successfully',
          data: result
        }

    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAllByTypeAndUserId(
        @Req() req,
        @Query('type') type?: CartItemType,  
    ): Promise<any> {
      const currentUser = req.user;
        const result = await this.cartService.findAllByTypeAndUserId(type, currentUser.id);
        return {
          message: 'Data has been retrieved successfully',
          count: result.length,
          data: result
        }
    }
}
