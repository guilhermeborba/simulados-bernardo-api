import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { TurmasModule } from '../turmas/turmas.module';
import { AttemptsController } from './attempts.controller';
import { AttemptsCorrectionService } from './attempts-correction.service';
import { AttemptsService } from './attempts.service';

@Module({
  imports: [DatabaseModule, JwtModule, TurmasModule],
  controllers: [AttemptsController],
  providers: [AttemptsService, AttemptsCorrectionService],
})
export class AttemptsModule {}
