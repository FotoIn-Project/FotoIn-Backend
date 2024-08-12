import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  ManyToOne,
} from 'typeorm';
import { TransactionType, TransactionStatus } from '../dto/create-wallet.dto';
import { User } from 'src/users/entities/user.entity';

export enum TransactionMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  // Add other methods as needed
}

@Entity()
export class WalletTransaction {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => User, (user) => user.wallet)
  user: User;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.IN_PROGRESS,
  })
  status: TransactionStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  proofLink: string;

  // New fields
  @Column({ type: 'enum', enum: TransactionMethod })
  method: TransactionMethod;

  @Column({ nullable: true })
  accountName: string;

  @Column({ nullable: true })
  accountNumber: string;

  // Auditor fields
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ default: 'SYSTEM' })
  created_by: string;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ default: 'SYSTEM' })
  updated_by: string;

  @BeforeInsert()
  generateProfileId() {
    this.id = new Date().valueOf();
  }
}
