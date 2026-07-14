import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AuthenticatedUser,
  JwtAuthGuard,
} from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { StudentsService } from './students.service';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('me')
  @Roles(UserRole.STUDENT)
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.studentsService.getMe(user);
  }

  @Patch('me')
  @Roles(UserRole.STUDENT)
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateStudentProfileDto,
  ) {
    return this.studentsService.updateMe(user, dto);
  }

  @Get(':id')
  @Roles(UserRole.STUDENT, UserRole.GUARDIAN, UserRole.ADMIN, UserRole.TEACHER)
  getStudent(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.studentsService.getStudent(id, user);
  }

  @Get(':id/attempts')
  @Roles(UserRole.STUDENT, UserRole.GUARDIAN, UserRole.ADMIN, UserRole.TEACHER)
  getAttempts(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.studentsService.getAttempts(id, user);
  }

  @Get(':id/performance')
  @Roles(UserRole.STUDENT, UserRole.GUARDIAN, UserRole.ADMIN, UserRole.TEACHER)
  getPerformance(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.studentsService.getPerformance(id, user);
  }
}
