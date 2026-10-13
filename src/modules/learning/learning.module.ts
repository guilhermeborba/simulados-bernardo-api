import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CollectionsModule } from '../collections/collections.module';
import { DatabaseModule } from '../../database/database.module';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';

@Module({
  imports: [DatabaseModule, JwtModule, CollectionsModule],
  controllers: [LearningController, MissionsController],
  providers: [LearningService, MissionsService],
  exports: [LearningService],
})
export class LearningModule {}
