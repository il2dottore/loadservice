import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '@databases/postgresql/postgresql.module';
import { PlanController } from './plan.controller';
import { PlanRepository } from './plan.repository';
import { PlanService } from './services/plan.service';

@Module({
  imports: [PostgresDatabaseModule],
  controllers: [PlanController],
  providers: [PlanService, PlanRepository],
  exports: [PlanService]
})
export class PlanModule {}
