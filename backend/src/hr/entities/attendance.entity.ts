import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'uuid' })
  employee_id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'timestamptz', nullable: true })
  clock_in: Date;

  @Column({ type: 'timestamptz', nullable: true })
  clock_out: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  hours_worked: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overtime_hours: number;

  @Column({ length: 20, default: 'present' })
  status: string; // present, absent, late, half_day, on_leave

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
