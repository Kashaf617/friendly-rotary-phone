import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string; // Link to users table if they have system access

  @Column({ length: 50, unique: true })
  employee_number: string;

  @Column({ length: 100 })
  first_name: string;

  @Column({ length: 100 })
  last_name: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  position: string;

  @Column({ length: 100, nullable: true })
  department: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'date', nullable: true })
  hire_date: Date;

  @Column({ type: 'date', nullable: true })
  termination_date: Date;

  @Column({ length: 20, default: 'active' })
  status: string; // active, on_leave, terminated, probation

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  base_salary: number;

  @Column({ length: 10, default: 'AED' })
  salary_currency: string;

  @Column({ length: 50, nullable: true })
  bank_name: string;

  @Column({ length: 50, nullable: true })
  bank_account_number: string;

  @Column({ length: 20, nullable: true })
  iban: string;

  @Column({ length: 100, nullable: true })
  emirates_id: string;

  @Column({ length: 50, nullable: true })
  passport_number: string;

  @Column({ type: 'date', nullable: true })
  visa_expiry_date: Date;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 255, nullable: true })
  emergency_contact_name: string;

  @Column({ length: 50, nullable: true })
  emergency_contact_phone: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
