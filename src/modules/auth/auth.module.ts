import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { TurmasModule } from '../turmas/turmas.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [DatabaseModule, JwtModule, UsersModule, TurmasModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
