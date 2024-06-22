import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transactions.entity';
import { coreApi } from 'src/utils/midtrans/midtrans-config';

@Injectable()
export class TransactionsService {
    private readonly logger = new Logger(TransactionsService.name);
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

async createTransaction(orderId: string, paymentType: string, amount: number, bank?: string): Promise<any> {
    this.logger.log(`Creating transaction with orderId: ${orderId}, paymentType: ${paymentType}, amount: ${amount}, bank: ${bank}`);

    let transactionParams: any = {
      payment_type: paymentType,
      transaction_details: {
        gross_amount: amount,
        order_id: orderId,
      },
    };

    if (paymentType === 'bank_transfer') {
      if (!bank) {
        this.logger.error('Bank must be specified for bank transfer');
        throw new Error('Bank must be specified for bank transfer');
      }

      transactionParams.bank_transfer = { bank: bank.toLowerCase() };

      if (!transactionParams.bank_transfer) {
        this.logger.error('Unsupported bank or bank not specified');
        throw new Error('Unsupported bank or bank not specified');
      }
    } else if (paymentType === 'qris') {
      transactionParams = {
        payment_type: 'qris',
        transaction_details: {
          gross_amount: amount,
          order_id: orderId,
        },
        qris: {},
      };
    }

    const response = await coreApi.charge(transactionParams);

    const transaction = new Transaction();
    transaction.orderId = orderId;
    transaction.paymentType = paymentType;
    transaction.transactionStatus = response.transaction_status;
    transaction.grossAmount = amount;
    transaction.transactionTime = new Date(response.transaction_time);

    await this.transactionsRepository.save(transaction);

    return response;
  }

  async checkAndUpdateTransactionStatus(orderId: string): Promise<any> {
    const response = await coreApi.transaction.status(orderId);

    const transaction = await this.transactionsRepository.findOne({ where: { orderId } });

    if (transaction) {
      transaction.transactionStatus = response.transaction_status;
      transaction.paymentType = response.payment_type;
      transaction.grossAmount = parseFloat(response.gross_amount);
      transaction.transactionTime = new Date(response.transaction_time);

      await this.transactionsRepository.save(transaction);
    }

    return response;
  }
}

