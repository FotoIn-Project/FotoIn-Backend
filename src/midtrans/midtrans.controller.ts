import { Controller, Post, Body } from '@nestjs/common';
import { MidtransService } from './midtrans.service';

@Controller('midtrans')
export class MidtransController {
  constructor(private readonly midtransService: MidtransService) {}

  @Post('payment')
  async createPayment(@Body() body: { orderId: string; grossAmount: number; customerDetails: any }) {
    const { orderId, grossAmount, customerDetails } = body;
    const paymentResponse = await this.midtransService.createTransaction(orderId, grossAmount, customerDetails);
    return paymentResponse;
  }
}
