import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { AttemptsController } from './attempts.controller';
import { AttemptsCorrectionService } from './attempts-correction.service';
import { AttemptsService } from './attempts.service';

@Module({
  imports: [DatabaseModule, JwtModule],
  controllers: [AttemptsController],
  providers: [AttemptsService, AttemptsCorrectionService],
})
export class AttemptsModule {}
