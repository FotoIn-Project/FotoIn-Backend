import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletTransaction } from './entities/wallet.entity';
import { CreateWalletTransactionDto, TransactionStatus, TransactionType } from './dto/create-wallet.dto';
import { UpdateTransactionStatusDto } from './dto/update-wallet.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createTransaction(createWalletTransactionDto: CreateWalletTransactionDto, currentUserId: number): Promise<WalletTransaction> {
    const { type, amount } = createWalletTransactionDto;
    const user = await this.userRepository.findOne({ where: { id: currentUserId } });
    if (!user) {
      throw new Error('User not found');
    }

    if (type === TransactionType.WITHDRAW) {
      const balance = await this.getBalance(currentUserId);
      if (amount > balance) {
        throw new BadRequestException('Insufficient balance for withdrawal');
      }

      const inProgressWithdrawal = await this.walletTransactionRepository.findOne({
        where: {
          user: { id: currentUserId },
          type: TransactionType.WITHDRAW,
          status: TransactionStatus.IN_PROGRESS,
        },
      });

      if (inProgressWithdrawal) {
        throw new BadRequestException('There is already a withdrawal in progress');
      }
    }

    const status = type === TransactionType.INCOME ? TransactionStatus.APPROVE : TransactionStatus.IN_PROGRESS;

    const transaction = this.walletTransactionRepository.create({
      ...createWalletTransactionDto,
      user,
      status
    });

    return this.walletTransactionRepository.save(transaction);
  }

  async updateTransactionStatus(updateTransactionStatusDto: UpdateTransactionStatusDto): Promise<WalletTransaction> {
    const transaction = await this.walletTransactionRepository.findOne({ where: { id: updateTransactionStatusDto.id } });
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    transaction.status = updateTransactionStatusDto.status;
    return this.walletTransactionRepository.save(transaction);
  }

  async getBalance(userId: number): Promise<number> {
    const income = await this.walletTransactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: TransactionType.INCOME })
      .andWhere('transaction.status = :status', { status: TransactionStatus.APPROVE })
      .select('SUM(transaction.amount)', 'sum')
      .getRawOne();

    const withdraw = await this.walletTransactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: TransactionType.WITHDRAW })
      .andWhere('transaction.status = :status', { status: TransactionStatus.APPROVE })
      .select('SUM(transaction.amount)', 'sum')
      .getRawOne();

    return (income.sum || 0) - (withdraw.sum || 0);
  }

  async getWithdrawHistory(userId: number): Promise<WalletTransaction[]> {
    return this.walletTransactionRepository.find({
      where: { user: { id: userId }, type: TransactionType.WITHDRAW },
      order: { created_at: 'DESC' },
    });
  }

  async getIncomeHistory(userId: number): Promise<WalletTransaction[]> {
    return this.walletTransactionRepository.find({
      where: { user: { id: userId }, type: TransactionType.INCOME },
      order: { created_at: 'DESC' },
    });
  }

  async getWithdrawInProgress(): Promise<WalletTransaction[]> {
    return this.walletTransactionRepository.find({
      where: { type: TransactionType.WITHDRAW, status: TransactionStatus.IN_PROGRESS },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }
}
