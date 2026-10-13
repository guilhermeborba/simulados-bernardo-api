import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AuthenticatedUser,
  JwtAuthGuard,
} from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { StudentAccessService } from '../students/student-access.service';

@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachersController {
  constructor(private readonly access: StudentAccessService) {}
  @Get('oversight-students')
  @Roles(UserRole.GUARDIAN, UserRole.TEACHER, UserRole.ADMIN)
  students(@CurrentUser() user: AuthenticatedUser) {
    return this.access.oversightStudents(user);
  }
}
