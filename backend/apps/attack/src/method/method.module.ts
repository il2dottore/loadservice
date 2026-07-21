import { Module } from '@nestjs/common';
import { MethodController } from './method.controller';
import { MethodRepository } from './method.repository';
import { MethodService } from './method.service';

@Module({
  imports: [],
  controllers: [MethodController],
  providers: [MethodService, MethodRepository],
  exports: [MethodService, MethodRepository],
})
export class MethodModule {}
