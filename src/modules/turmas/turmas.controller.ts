import {
  Body,
  Controller,
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
  listTurmas() {
    return this.turmasService.listTurmas();
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
    return this.turmasService.createInvite(id, dto, user.id);
  }

  @Post('turmas/invites/:inviteId/revoke')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(200)
  revokeInvite(@Param('inviteId') inviteId: string) {
    return this.turmasService.revokeInvite(inviteId);
  }

  @Get('me/turmas')
  @Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.TEACHER)
  listMyTurmas(@CurrentUser() user: AuthenticatedUser) {
    return this.turmasService.listMyTurmas(user.id);
  }

  /** Para quem já tinha conta antes de receber o convite. */
  @Post('me/turmas/join')
  @HttpCode(200)
  @Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.TEACHER)
  join(@Body() dto: RedeemInviteDto, @CurrentUser() user: AuthenticatedUser) {
    return this.turmasService.redeemInvite(dto.token, user.id);
  }
}
