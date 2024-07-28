import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transactions.entity';
import { coreApi } from 'src/utils/midtrans/midtrans-config';
import { Catalog } from 'src/catalog/entities/catalog.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class TransactionsService {
    private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Catalog)
    private catalogRepository: Repository<Catalog>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

async createTransaction(paymentType: string, catalogId: number, bank?: string, currentUser?: any): Promise<any> {
  const orderId = `order-${new Date().getTime()}`; // Generate a unique order ID
  this.logger.log(`Creating transaction with orderId: ${orderId}, paymentType: ${paymentType}, catalogId: ${catalogId}, bank: ${bank}`);

  // Fetch the catalog item to get the price
  const catalogItem = await this.catalogRepository.findOne({ where: { id: catalogId } });
  if (!catalogItem) {
    this.logger.error(`Catalog item with id ${catalogId} not found`);
    throw new Error('Catalog item not found');
  }
  const amount = catalogItem.price;

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
  } else if (paymentType === 'qris') {
    transactionParams.qris = {};
  }

  const response = await coreApi.charge(transactionParams);

  const user = await this.usersRepository.findOne({ where: { id: currentUser } });
  if (!user) {
    this.logger.error(`User with id ${currentUser} not found`);
    throw new Error('User not found');
  }

  const transaction = new Transaction();
  transaction.orderId = orderId;
  transaction.paymentType = paymentType;
  transaction.transactionStatus = response.transaction_status;
  transaction.grossAmount = amount;
  transaction.transactionTime = new Date(response.transaction_time);
  transaction.user = user;

  await this.transactionsRepository.save(transaction);

  // Extracting VA number if available
  let va_number = null;
  if (paymentType === 'bank_transfer') {
    if (bank === 'permata' && response.permata_va_number) {
      va_number = response.permata_va_number;
    } else if (response.va_numbers && response.va_numbers.length > 0) {
      va_number = response.va_numbers[0]?.va_number;
    }
  }

  return {
    ...response,
    va_numbers: va_number,
  };
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

