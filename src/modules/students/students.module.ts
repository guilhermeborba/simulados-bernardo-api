import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { StudentAccessService } from './student-access.service';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  imports: [DatabaseModule, JwtModule],
  controllers: [StudentsController],
  providers: [StudentsService, StudentAccessService],
  exports: [StudentAccessService, StudentsService],
})
export class StudentsModule {}
