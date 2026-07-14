import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AuthenticatedUser,
  JwtAuthGuard,
} from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('student/:studentId/summary')
  @Roles(UserRole.STUDENT, UserRole.GUARDIAN, UserRole.ADMIN, UserRole.TEACHER)
  getStudentSummary(
    @Param('studentId') studentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reportsService.getStudentSummary(studentId, user);
  }

  @Get('student/:studentId/by-discipline')
  @Roles(UserRole.STUDENT, UserRole.GUARDIAN, UserRole.ADMIN, UserRole.TEACHER)
  getStudentByDiscipline(
    @Param('studentId') studentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reportsService.getStudentByDiscipline(studentId, user);
  }

  @Get('simulations/:simulationId/performance')
  @Roles(UserRole.ADMIN)
  getSimulationPerformance(@Param('simulationId') simulationId: string) {
    return this.reportsService.getSimulationPerformance(simulationId);
  }

  @Get('questions/error-rate')
  @Roles(UserRole.ADMIN)
  getQuestionsErrorRate() {
    return this.reportsService.getQuestionsErrorRate();
  }
}
