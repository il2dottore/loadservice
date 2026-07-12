import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';
import { PlanRepository } from './plan.repository';
import { PlanService } from './services/plan.service';
import { PostgresDatabaseModule } from '@app/database/postgresql/postgresql.module';

@Module({
  imports: [
    PostgresDatabaseModule.forService()
  ],
  controllers: [PlanController],
  providers: [PlanService, PlanRepository],
  exports: [PlanService]
})
export class PlanModule { }
