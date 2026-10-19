import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { LearningSkillsModule } from '../learning-skills/learning-skills.module';
import { LearningModule } from '../learning/learning.module';
import { TurmasModule } from '../turmas/turmas.module';
import { AttemptsController } from './attempts.controller';
import { AttemptsCorrectionService } from './attempts-correction.service';
import { AttemptsService } from './attempts.service';
import { SimulationFeedbackService } from './simulation-feedback.service';
import { QuizAttemptsService } from './quiz-attempts.service';
import { QuizMediaController } from '../quizzes/media/quiz-media.controller';

@Module({
  imports: [
    DatabaseModule,
    JwtModule,
    TurmasModule,
    LearningModule,
    LearningSkillsModule,
  ],
  controllers: [AttemptsController, QuizMediaController],
  providers: [
    AttemptsService,
    AttemptsCorrectionService,
    QuizAttemptsService,
    SimulationFeedbackService,
  ],
})
export class AttemptsModule {}
