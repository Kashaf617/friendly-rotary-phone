import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 50, nullable: true })
  sku: string;

  @Column({ length: 50 })
  unit: string; // kg, liter, piece, pack, etc.

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  stock_level: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 10 })
  low_stock_threshold: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unit_cost: number;

  @Column({ type: 'uuid', nullable: true })
  supplier_id: string;

  @Column({ length: 100, nullable: true })
  category: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  last_restocked_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
