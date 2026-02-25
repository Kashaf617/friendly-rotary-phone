import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ length: 20 })
  type: string; // income, expense, transfer

  @Column({ length: 100 })
  category: string; // sales, purchase, salary, rent, utilities, etc.

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 10, default: 'AED' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50, nullable: true })
  reference_number: string;

  @Column({ type: 'uuid', nullable: true })
  invoice_id: string;

  @Column({ type: 'uuid', nullable: true })
  order_id: string;

  @Column({ length: 20, nullable: true })
  payment_method: string;

  @Column({ type: 'date' })
  transaction_date: Date;

  @Column({ type: 'uuid', nullable: true })
  recorded_by: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
