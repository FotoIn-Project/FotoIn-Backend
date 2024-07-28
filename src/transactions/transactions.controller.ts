// src/transactions/transactions.controller.ts
import { Controller, Post, Body, Patch, Param, UsePipes, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.auth.guard';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseGuards(JwtAuthGuard)
  async create(@Body() createTransactionDto : CreateTransactionDto, @Req() req) {
    const currentUser = req.user;    
    const { paymentType, catalogId, bank } = createTransactionDto; 
    return await this.transactionsService.createTransaction(paymentType, catalogId, bank, currentUser.id);
  }

   @Patch('check-status/:orderId')
  async checkTransactionStatus(@Param('orderId') orderId: string) {
    return await this.transactionsService.checkAndUpdateTransactionStatus(orderId);
  }
}
