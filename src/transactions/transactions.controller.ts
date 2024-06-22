// src/transactions/transactions.controller.ts
import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(@Body() createTransactionDto: { orderId: string; paymentType: string; amount: number, bank:string }) {
    const { orderId, paymentType, amount, bank } = createTransactionDto;
    return await this.transactionsService.createTransaction(orderId, paymentType, amount, bank);
  }

   @Patch('check-status/:orderId')
  async checkTransactionStatus(@Param('orderId') orderId: string) {
    return await this.transactionsService.checkAndUpdateTransactionStatus(orderId);
  }
}
