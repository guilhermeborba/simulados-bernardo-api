import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { LearningPreferencesController } from './learning-preferences.controller';
import { LearningPreferencesService } from './learning-preferences.service';

@Module({
  imports: [DatabaseModule, JwtModule],
  controllers: [LearningPreferencesController],
  providers: [LearningPreferencesService],
})
export class LearningPreferencesModule {}
