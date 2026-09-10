import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { TurmasModule } from '../turmas/turmas.module';
import { PontuacaoController } from './pontuacao.controller';
import { PontuacaoService } from './pontuacao.service';

@Module({
  imports: [DatabaseModule, JwtModule, TurmasModule],
  controllers: [PontuacaoController],
  providers: [PontuacaoService],
})
export class PontuacaoModule {}
