// src/transactions/transaction.entity.ts
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: string;

  @Column()
  paymentType: string;

  @Column()
  transactionStatus: string;

  @Column()
  grossAmount: number;

  @Column()
  transactionTime: Date;

  @ManyToOne(() => User, user => user.transactions)
  user: User;
}
