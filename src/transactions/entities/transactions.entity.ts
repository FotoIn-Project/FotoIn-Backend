// src/transactions/transaction.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}
