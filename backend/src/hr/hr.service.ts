import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { Attendance } from './entities/attendance.entity';
import { Payroll } from './entities/payroll.entity';

@Injectable()
export class HrService {
  private readonly logger = new Logger(HrService.name);
  private empCounter: Record<string, number> = {};

  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Payroll)
    private payrollRepository: Repository<Payroll>,
  ) {}

  // Employees
  private generateEmployeeNumber(tenantId: string): string {
    if (!this.empCounter[tenantId]) this.empCounter[tenantId] = 0;
    this.empCounter[tenantId]++;
    return `EMP-${String(this.empCounter[tenantId]).padStart(5, '0')}`;
  }

  async findAllEmployees(tenantId: string) {
    return this.employeeRepository.find({
      where: { tenant_id: tenantId },
      order: { first_name: 'ASC' },
    });
  }

  async findEmployee(id: string, tenantId: string) {
    const emp = await this.employeeRepository.findOne({
      where: { id, tenant_id: tenantId },
    });
    if (!emp) throw new NotFoundException('Employee not found');
    return emp;
  }

  async createEmployee(tenantId: string, data: Partial<Employee>) {
    const employee = this.employeeRepository.create({
      ...data,
      tenant_id: tenantId,
      employee_number: this.generateEmployeeNumber(tenantId),
    });
    return this.employeeRepository.save(employee);
  }

  async updateEmployee(id: string, tenantId: string, data: Partial<Employee>) {
    const emp = await this.findEmployee(id, tenantId);
    Object.assign(emp, data);
    return this.employeeRepository.save(emp);
  }

  async removeEmployee(id: string, tenantId: string) {
    const emp = await this.findEmployee(id, tenantId);
    await this.employeeRepository.remove(emp);
    return { message: 'Employee deleted' };
  }

  // Attendance
  async clockIn(tenantId: string, employeeId: string) {
    const today = new Date().toISOString().split('T')[0];
    let record = await this.attendanceRepository.findOne({
      where: { tenant_id: tenantId, employee_id: employeeId, date: new Date(today) },
    });

    if (record && record.clock_in) {
      return { message: 'Already clocked in today', record };
    }

    if (!record) {
      record = this.attendanceRepository.create({
        tenant_id: tenantId,
        employee_id: employeeId,
        date: new Date(today),
        clock_in: new Date(),
        status: 'present',
      });
    } else {
      record.clock_in = new Date();
      record.status = 'present';
    }

    return this.attendanceRepository.save(record);
  }

  async clockOut(tenantId: string, employeeId: string) {
    const today = new Date().toISOString().split('T')[0];
    const record = await this.attendanceRepository.findOne({
      where: { tenant_id: tenantId, employee_id: employeeId, date: new Date(today) },
    });

    if (!record || !record.clock_in) {
      throw new NotFoundException('No clock-in record found for today');
    }

    record.clock_out = new Date();
    const diffMs = record.clock_out.getTime() - record.clock_in.getTime();
    record.hours_worked = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
    record.overtime_hours = record.hours_worked > 8 ? Number((record.hours_worked - 8).toFixed(2)) : 0;

    return this.attendanceRepository.save(record);
  }

  async getAttendance(tenantId: string, employeeId?: string, month?: string) {
    const qb = this.attendanceRepository.createQueryBuilder('a')
      .where('a.tenant_id = :tenantId', { tenantId });

    if (employeeId) qb.andWhere('a.employee_id = :employeeId', { employeeId });
    if (month) {
      qb.andWhere("TO_CHAR(a.date, 'YYYY-MM') = :month", { month });
    }

    return qb.orderBy('a.date', 'DESC').getMany();
  }

  // Payroll
  async generatePayroll(tenantId: string, period: string) {
    const employees = await this.employeeRepository.find({
      where: { tenant_id: tenantId, status: 'active' },
    });

    const payrolls: Payroll[] = [];

    for (const emp of employees) {
      const existing = await this.payrollRepository.findOne({
        where: { tenant_id: tenantId, employee_id: emp.id, period },
      });

      if (existing) continue;

      // Get attendance for the period
      const attendance = await this.attendanceRepository
        .createQueryBuilder('a')
        .where('a.tenant_id = :tenantId', { tenantId })
        .andWhere('a.employee_id = :employeeId', { employeeId: emp.id })
        .andWhere("TO_CHAR(a.date, 'YYYY-MM') = :period", { period })
        .getMany();

      const totalOvertime = attendance.reduce((sum, a) => sum + Number(a.overtime_hours || 0), 0);
      const overtimePay = Number((totalOvertime * (Number(emp.base_salary) / 30 / 8) * 1.25).toFixed(2));
      const netSalary = Number(emp.base_salary) + overtimePay;

      const payroll = this.payrollRepository.create({
        tenant_id: tenantId,
        employee_id: emp.id,
        period,
        base_salary: emp.base_salary,
        overtime_pay: overtimePay,
        allowances: 0,
        deductions: 0,
        net_salary: netSalary,
        currency: 'AED',
        status: 'pending',
        breakdown: {
          base_salary: Number(emp.base_salary),
          overtime_hours: totalOvertime,
          overtime_pay: overtimePay,
          days_worked: attendance.filter((a) => a.status === 'present').length,
        },
      });

      payrolls.push(await this.payrollRepository.save(payroll));
    }

    return payrolls;
  }

  async getPayroll(tenantId: string, period?: string) {
    const where: any = { tenant_id: tenantId };
    if (period) where.period = period;
    return this.payrollRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  async approvePayroll(id: string, tenantId: string) {
    const payroll = await this.payrollRepository.findOne({
      where: { id, tenant_id: tenantId },
    });
    if (!payroll) throw new NotFoundException('Payroll record not found');
    payroll.status = 'approved';
    return this.payrollRepository.save(payroll);
  }

  async exportWPS(tenantId: string, period: string) {
    const payrolls = await this.payrollRepository.find({
      where: { tenant_id: tenantId, period, status: 'approved' },
    });

    const employees = await this.employeeRepository.find({
      where: { tenant_id: tenantId },
    });

    const empMap = new Map(employees.map((e) => [e.id, e]));

    // Generate WPS-compatible SIF (Salary Information File) data
    const wpsRecords = payrolls.map((p) => {
      const emp = empMap.get(p.employee_id);
      return {
        employee_number: emp?.employee_number,
        employee_name: emp ? `${emp.first_name} ${emp.last_name}` : '',
        bank_name: emp?.bank_name,
        iban: emp?.iban,
        base_salary: p.base_salary,
        allowances: p.allowances,
        deductions: p.deductions,
        net_salary: p.net_salary,
        currency: 'AED',
      };
    });

    return {
      period,
      total_records: wpsRecords.length,
      total_amount: wpsRecords.reduce((sum, r) => sum + Number(r.net_salary), 0),
      records: wpsRecords,
    };
  }
}
