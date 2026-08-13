import {
  Body,
  Controller,
  Get,
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
import { AttemptsService } from './attempts.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { SubmitAttemptAnswerDto } from './dto/submit-attempt-answer.dto';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post('simulations/:simulationId/attempts')
  @Roles(UserRole.STUDENT)
  startAttempt(
    @Param('simulationId') simulationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.attemptsService.startAttempt(simulationId, user.id);
  }

  @Get('attempts/:id')
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  findAttempt(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.attemptsService.findAttempt(id, user);
  }

  @Get('attempts/:id/questions')
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  getAttemptQuestions(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.attemptsService.getAttemptQuestions(id, user);
  }

  @Post('attempts/:id/questions/:questionId/answer')
  @Roles(UserRole.STUDENT)
  submitAnswer(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
    @Body() dto: SubmitAnswerDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.attemptsService.submitAnswer(id, questionId, dto, user);
  }

  @Post('attempts/:id/answers')
  @Roles(UserRole.STUDENT)
  submitAnswerLegacyRoute(
    @Param('id') id: string,
    @Body() dto: SubmitAttemptAnswerDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.attemptsService.submitAnswer(id, dto.questionId, dto, user);
  }

  @Post('attempts/:id/finish')
  @Roles(UserRole.STUDENT)
  finishAttempt(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.attemptsService.finishAttempt(id, user);
  }

  @Get('attempts/:id/result')
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  getResult(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.attemptsService.getResult(id, user);
  }

  @Get('me/attempts')
  @Roles(UserRole.STUDENT)
  findMyAttempts(@CurrentUser() user: AuthenticatedUser) {
    return this.attemptsService.findMyAttempts(user.id);
  }
}
