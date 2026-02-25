import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ length: 50, unique: true })
  order_number: string;

  @Column({ length: 20, default: 'dine_in' })
  order_type: string; // dine_in, takeaway, delivery

  @Column({ length: 20, default: 'pending' })
  status: string; // pending, confirmed, preparing, ready, served, completed, cancelled

  @Column({ type: 'uuid', nullable: true })
  waiter_id: string;

  @Column({ type: 'uuid', nullable: true })
  cashier_id: string;

  @Column({ length: 50, nullable: true })
  table_number: string;

  @Column({ type: 'int', default: 1 })
  guest_count: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount_percent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  vat_amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.05 })
  vat_rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_amount: number;

  @Column({ length: 20, nullable: true })
  payment_method: string; // cash, card, online, split

  @Column({ length: 20, default: 'unpaid' })
  payment_status: string; // unpaid, paid, partially_paid, refunded

  @Column({ type: 'jsonb', nullable: true })
  split_details: { method: string; amount: number }[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true })
  customer_id: string;

  @Column({ length: 10, default: 'AED' })
  currency: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
