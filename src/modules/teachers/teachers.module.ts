import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { StudentsModule } from '../students/students.module';
import { TeachersController } from './teachers.controller';
@Module({
  imports: [DatabaseModule, JwtModule, StudentsModule],
  controllers: [TeachersController],
})
export class TeachersModule {}
