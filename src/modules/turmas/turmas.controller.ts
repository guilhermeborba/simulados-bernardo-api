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
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { RedeemInviteDto } from './dto/redeem-invite.dto';
import { TurmasService } from './turmas.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TurmasController {
  constructor(private readonly turmasService: TurmasService) {}

  @Get('turmas')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  listTurmas(@CurrentUser() user: AuthenticatedUser) {
    return this.turmasService.listTurmas(user);
  }

  @Post('turmas')
  @Roles(UserRole.ADMIN)
  createTurma(@Body() dto: CreateTurmaDto) {
    return this.turmasService.createTurma(dto);
  }

  @Post('turmas/:id/invites')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  createInvite(
    @Param('id') id: string,
    @Body() dto: CreateInviteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.turmasService.createInvite(id, dto, user);
  }

  @Post('turmas/invites/:inviteId/revoke')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(200)
  revokeInvite(
    @Param('inviteId') inviteId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.turmasService.revokeInvite(inviteId, user);
  }

  @Get('me/turmas')
  @Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.TEACHER)
  listMyTurmas(@CurrentUser() user: AuthenticatedUser) {
    return this.turmasService.listMyTurmas(user);
  }

  @Post('turmas/:id/teachers')
  @Roles(UserRole.ADMIN)
  assignTeacher(
    @Param('id') id: string,
    @Body() dto: AssignTeacherDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.turmasService.assignTeacher(id, dto.teacherId, user);
  }

  @Delete('turmas/:id/teachers/:teacherId')
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  async unassignTeacher(
    @Param('id') id: string,
    @Param('teacherId') teacherId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.turmasService.unassignTeacher(id, teacherId, user);
  }

  /** Para quem já tinha conta antes de receber o convite. */
  @Post('me/turmas/join')
  @HttpCode(200)
  @Roles(UserRole.STUDENT)
  join(@Body() dto: RedeemInviteDto, @CurrentUser() user: AuthenticatedUser) {
    return this.turmasService.redeemInvite(dto.token, user.id);
  }
}
