import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @Column({ length: 255, nullable: true })
  logo_url: string;

  @Column({ length: 50, default: 'trial' })
  subscription_plan: string;

  @Column({ type: 'timestamptz', nullable: true })
  subscription_expires_at: Date;

  @Column({ default: true })
  is_active: boolean;

  @Column({ length: 255, nullable: true })
  contact_email: string;

  @Column({ length: 50, nullable: true })
  contact_phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, default: 'UAE' })
  country: string;

  @Column({ length: 50, nullable: true })
  trn: string; // Tax Registration Number for UAE VAT

  @Column({ length: 10, default: 'AED' })
  currency: string;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>; // Branding, feature flags, etc.

  @Column({ type: 'jsonb', nullable: true })
  feature_flags: Record<string, boolean>;

  @Column({ type: 'int', default: 50 })
  max_users: number;

  @Column({ type: 'int', default: 1 })
  max_branches: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
