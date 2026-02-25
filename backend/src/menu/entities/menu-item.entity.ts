import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MenuCategory } from './menu-category.entity';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'uuid' })
  category_id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 255, nullable: true })
  name_ar: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost_price: number; // For COGS calculation

  @Column({ length: 255, nullable: true })
  image_url: string;

  @Column({ type: 'jsonb', nullable: true })
  modifiers: {
    name: string;
    options: { label: string; price: number }[];
  }[];

  @Column({ type: 'jsonb', nullable: true })
  allergens: string[];

  @Column({ default: true })
  is_available: boolean;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'int', nullable: true })
  preparation_time_minutes: number;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ length: 10, default: 'AED' })
  currency: string;

  @ManyToOne(() => MenuCategory, (cat) => cat.items)
  @JoinColumn({ name: 'category_id' })
  category: MenuCategory;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
