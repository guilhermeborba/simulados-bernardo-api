import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AttemptsModule } from './modules/attempts/attempts.module';
import { AuthModule } from './modules/auth/auth.module';
import { DisciplinesModule } from './modules/disciplines/disciplines.module';
import { GuardiansModule } from './modules/guardians/guardians.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SimulationsModule } from './modules/simulations/simulations.module';
import { StudentsModule } from './modules/students/students.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    HealthModule,
    UsersModule,
    AuthModule,
    DisciplinesModule,
    SimulationsModule,
    QuestionsModule,
    AttemptsModule,
    StudentsModule,
    GuardiansModule,
    ReportsModule,
  ],
})
export class AppModule {}
