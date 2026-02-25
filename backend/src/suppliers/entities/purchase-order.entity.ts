import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ length: 50, unique: true })
  po_number: string;

  @Column({ type: 'uuid' })
  supplier_id: string;

  @Column({ length: 20, default: 'draft' })
  status: string; // draft, submitted, approved, received, cancelled

  @Column({ type: 'jsonb' })
  items: {
    inventory_item_id: string;
    name: string;
    quantity: number;
    unit: string;
    unit_cost: number;
    total: number;
  }[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  vat_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'timestamptz', nullable: true })
  expected_delivery_date: Date;

  @Column({ type: 'timestamptz', nullable: true })
  received_date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true })
  approved_by: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
