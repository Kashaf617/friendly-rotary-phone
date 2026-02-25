import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Attendance } from './entities/attendance.entity';
import { Payroll } from './entities/payroll.entity';
import { HrService } from './hr.service';
import { HrController } from './hr.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Attendance, Payroll])],
  controllers: [HrController],
  providers: [HrService],
  exports: [HrService],
})
export class HrModule {}
