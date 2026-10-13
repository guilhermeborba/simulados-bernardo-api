import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { LearningSkillsController } from './learning-skills.controller';
import { LearningSkillsService } from './learning-skills.service';
@Module({
  imports: [DatabaseModule, JwtModule],
  controllers: [LearningSkillsController],
  providers: [LearningSkillsService],
  exports: [LearningSkillsService],
})
export class LearningSkillsModule {}
