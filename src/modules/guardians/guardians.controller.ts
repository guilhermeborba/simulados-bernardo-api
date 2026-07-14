import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AuthenticatedUser,
  JwtAuthGuard,
} from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { LinkGuardianStudentDto } from './dto/link-guardian-student.dto';
import { GuardiansService } from './guardians.service';

@Controller('guardians')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GuardiansController {
  constructor(private readonly guardiansService: GuardiansService) {}

  @Get('me/students')
  @Roles(UserRole.GUARDIAN)
  findMyStudents(@CurrentUser() user: AuthenticatedUser) {
    return this.guardiansService.findMyStudents(user.id);
  }

  @Post('students')
  @Roles(UserRole.ADMIN)
  linkStudent(@Body() dto: LinkGuardianStudentDto) {
    return this.guardiansService.linkStudent(dto);
  }

  @Delete(':guardianId/students/:studentId')
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  async unlinkStudent(
    @Param('guardianId') guardianId: string,
    @Param('studentId') studentId: string,
  ): Promise<void> {
    await this.guardiansService.unlinkStudent(guardianId, studentId);
  }
}
