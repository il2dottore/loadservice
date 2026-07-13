import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';
import { PlanRepository } from './plan.repository';
import { PostgresDatabaseModule } from '@app/database/postgresql/postgresql.module';
import { PlanService } from './plan.service';

@Module({
  imports: [
    PostgresDatabaseModule.forService()
  ],
  controllers: [PlanController],
  providers: [PlanService, PlanRepository],
  exports: [PlanService]
})
export class PlanModule { }
