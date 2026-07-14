import { Injectable } from '@nestjs/common';
import { AssignPlanFeatureDto } from './dtos/assign-plan-feature.dto';
import { CreatePlanDto } from './dtos/create-plan.dto';
import { UpdatePlanDto } from './dtos/update-plan.dto';
import { Plan } from './entities/plan.entity';
import { PlanRepository } from './plan.repository';

@Injectable()
export class PlanService {
  constructor(private readonly planRepository: PlanRepository) { }

  async getAll(): Promise<Plan[]> {
    return await this.planRepository.find();
  }

  async getById(id: number) {
    return await this.planRepository.queryPlanInfo(id);
  }

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    return await this.planRepository.insertOne(createPlanDto);
  }

  async update(id: number, updatePlanDto: UpdatePlanDto): Promise<Plan | null> {
    return await this.planRepository.updateOne({ id }, updatePlanDto);
  }

  async delete(id: number): Promise<Plan | null> {
    return await this.planRepository.deleteOne({ id });
  }

  async assignFeature(id: number, assignPlanFeatureDto: AssignPlanFeatureDto) {
    return await this.planRepository.assignFeature(id, assignPlanFeatureDto.featureId);
  }

  async removeFeature(id: number, featureId: string) {
    return await this.planRepository.removeFeature(id, featureId);
  }
}
