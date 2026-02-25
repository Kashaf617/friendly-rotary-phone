import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HrService } from './hr.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { Employee } from './entities/employee.entity';

@Controller('hr')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // Employees
  @Get('employees')
  @Roles('restaurant_admin', 'manager', 'hr_officer')
  findAllEmployees(@CurrentTenant() tenantId: string) {
    return this.hrService.findAllEmployees(tenantId);
  }

  @Get('employees/:id')
  @Roles('restaurant_admin', 'manager', 'hr_officer')
  findEmployee(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.hrService.findEmployee(id, tenantId);
  }

  @Post('employees')
  @Roles('restaurant_admin', 'hr_officer')
  createEmployee(@CurrentTenant() tenantId: string, @Body() data: Partial<Employee>) {
    return this.hrService.createEmployee(tenantId, data);
  }

  @Put('employees/:id')
  @Roles('restaurant_admin', 'hr_officer')
  updateEmployee(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() data: Partial<Employee>,
  ) {
    return this.hrService.updateEmployee(id, tenantId, data);
  }

  @Delete('employees/:id')
  @Roles('restaurant_admin', 'hr_officer')
  removeEmployee(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.hrService.removeEmployee(id, tenantId);
  }

  // Attendance
  @Post('attendance/clock-in/:employeeId')
  clockIn(@CurrentTenant() tenantId: string, @Param('employeeId') employeeId: string) {
    return this.hrService.clockIn(tenantId, employeeId);
  }

  @Post('attendance/clock-out/:employeeId')
  clockOut(@CurrentTenant() tenantId: string, @Param('employeeId') employeeId: string) {
    return this.hrService.clockOut(tenantId, employeeId);
  }

  @Get('attendance')
  @Roles('restaurant_admin', 'manager', 'hr_officer')
  getAttendance(
    @CurrentTenant() tenantId: string,
    @Query('employee_id') employeeId?: string,
    @Query('month') month?: string,
  ) {
    return this.hrService.getAttendance(tenantId, employeeId, month);
  }

  // Payroll
  @Post('payroll/generate')
  @Roles('restaurant_admin', 'hr_officer')
  generatePayroll(
    @CurrentTenant() tenantId: string,
    @Body('period') period: string,
  ) {
    return this.hrService.generatePayroll(tenantId, period);
  }

  @Get('payroll')
  @Roles('restaurant_admin', 'hr_officer')
  getPayroll(
    @CurrentTenant() tenantId: string,
    @Query('period') period?: string,
  ) {
    return this.hrService.getPayroll(tenantId, period);
  }

  @Patch('payroll/:id/approve')
  @Roles('restaurant_admin')
  approvePayroll(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.hrService.approvePayroll(id, tenantId);
  }

  @Get('payroll/wps-export')
  @Roles('restaurant_admin', 'hr_officer')
  exportWPS(
    @CurrentTenant() tenantId: string,
    @Query('period') period: string,
  ) {
    return this.hrService.exportWPS(tenantId, period);
  }
}
