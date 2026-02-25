import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('payroll')
export class Payroll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'uuid' })
  employee_id: string;

  @Column({ length: 20 })
  period: string; // e.g., "2025-01" for January 2025

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_salary: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overtime_pay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  allowances: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deductions: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  net_salary: number;

  @Column({ length: 10, default: 'AED' })
  currency: string;

  @Column({ length: 20, default: 'pending' })
  status: string; // pending, approved, paid, cancelled

  @Column({ type: 'date', nullable: true })
  payment_date: Date;

  @Column({ length: 50, nullable: true })
  payment_reference: string; // WPS reference

  @Column({ type: 'jsonb', nullable: true })
  breakdown: Record<string, number>; // Detailed breakdown

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
