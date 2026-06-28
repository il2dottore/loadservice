import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '@databases/postgresql/postgresql.module';
import { MethodController } from './method.controller';
import { MethodRepository } from './method.repository';
import { MethodService } from './services/method.service';

@Module({
  imports: [PostgresDatabaseModule],
  controllers: [MethodController],
  providers: [MethodService, MethodRepository],
  exports: [MethodService]
})
export class MethodModule {}
