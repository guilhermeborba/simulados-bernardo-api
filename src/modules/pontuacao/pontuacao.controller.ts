import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AuthenticatedUser,
  JwtAuthGuard,
} from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PontuacaoService } from './pontuacao.service';

@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PontuacaoController {
  constructor(private readonly pontuacaoService: PontuacaoService) {}

  @Get('pontuacao')
  @Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.TEACHER)
  getMinhaPontuacao(@CurrentUser() user: AuthenticatedUser) {
    return this.pontuacaoService.getMinhaPontuacao(user.id);
  }

  // Fica sob /me porque o ranking é sempre relativo a quem pergunta: traz a
  // sua posição e a sua vizinhança, não a lista inteira da turma.
  @Get('turmas/:turmaId/ranking')
  @Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.TEACHER)
  getRankingDaTurma(
    @Param('turmaId') turmaId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pontuacaoService.getRankingDaTurma(turmaId, user);
  }
}
