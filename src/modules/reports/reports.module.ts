import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { StudentsModule } from '../students/students.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [DatabaseModule, JwtModule, StudentsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
