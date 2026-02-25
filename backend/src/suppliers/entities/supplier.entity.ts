import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 255, nullable: true })
  contact_person: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 50, nullable: true })
  trn: string; // Tax Registration Number

  @Column({ type: 'jsonb', nullable: true })
  categories: string[]; // Types of items supplied

  @Column({ length: 20, default: 'active' })
  status: string; // active, inactive, blacklisted

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
