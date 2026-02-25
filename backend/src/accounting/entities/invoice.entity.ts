import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ length: 50, unique: true })
  invoice_number: string;

  @Column({ type: 'uuid', nullable: true })
  order_id: string;

  @Column({ type: 'uuid', nullable: true })
  customer_id: string;

  @Column({ length: 255, nullable: true })
  customer_name: string;

  @Column({ length: 50, nullable: true })
  trn: string; // Tax Registration Number

  @Column({ type: 'jsonb' })
  line_items: {
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.05 })
  vat_rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  vat_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({ length: 10, default: 'AED' })
  currency: string;

  @Column({ length: 20, default: 'unpaid' })
  payment_status: string; // unpaid, paid, partially_paid, overdue, cancelled

  @Column({ length: 20, nullable: true })
  payment_method: string;

  @Column({ type: 'timestamptz', nullable: true })
  paid_at: Date;

  @Column({ type: 'date', nullable: true })
  due_date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
