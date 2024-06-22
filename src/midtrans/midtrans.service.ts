import { Injectable } from '@nestjs/common';
import * as midtransClient from 'midtrans-client';

@Injectable()
export class MidtransService {
  private coreApi: midtransClient.CoreApi;

  constructor() {
    this.coreApi = new midtransClient.CoreApi({
      isProduction: false, // Ganti dengan true di lingkungan produksi
      serverKey: 'SB-Mid-client-wmzenE_OaF8tN4bV', // Ganti dengan server key Anda
      clientKey: 'SB-Mid-server-XyWkXtPVXPvc8loAzxRm09jV', // Ganti dengan client key Anda
    });
  }

  async createTransaction(orderId: string, grossAmount: number, customerDetails: any) {
    const parameter = {
        payment_type: 'gopay',
        transaction_details: {
            order_id: orderId,
            gross_amount: grossAmount,
        },
        customer_details: customerDetails,
    };

    try {
      const response = await this.coreApi.charge(parameter);
      return response;
    } catch (error) {
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }
}
