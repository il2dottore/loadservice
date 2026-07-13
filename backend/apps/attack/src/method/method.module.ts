import { Module } from '@nestjs/common';
import { MethodController } from './method.controller';
import { MethodRepository } from './method.repository';
import { MethodService } from './method.service';
import { PostgresDatabaseModule } from '@app/database/postgresql/postgresql.module';

@Module({
  imports: [
    PostgresDatabaseModule.forService()
  ],
  controllers: [MethodController],
  providers: [MethodService, MethodRepository],
  exports: [MethodService]
})
export class MethodModule { }
