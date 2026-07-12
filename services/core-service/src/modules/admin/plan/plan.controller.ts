import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AssignPlanFeatureDto } from './dtos/assign-plan-feature.dto';
import { CreatePlanDto } from './dtos/create-plan.dto';
import { UpdatePlanDto } from './dtos/update-plan.dto';
import { PlanService } from './services/plan.service';

@Controller('admin/plans')
export class PlanController {
  constructor(private readonly planService: PlanService) { }

  @ApiOperation({ summary: 'Get all plans' })
  @Get()
  async getAll() {
    return await this.planService.getAll();
  }

  @ApiOperation({ summary: 'Get plan by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.planService.getById(Number(id));
  }

  @ApiOperation({ summary: 'Create plan' })
  @Post('create')
  async create(@Body() createPlanDto: CreatePlanDto) {
    return await this.planService.create(createPlanDto);
  }

  @ApiOperation({ summary: 'Update plan' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return await this.planService.update(Number(id), updatePlanDto);
  }

  @ApiOperation({ summary: 'Delete plan' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.planService.delete(Number(id));
  }

  @ApiOperation({ summary: 'Assign feature to plan' })
  @Post(':id/features')
  async assignFeature(@Param('id') id: string, @Body() assignPlanFeatureDto: AssignPlanFeatureDto) {
    return await this.planService.assignFeature(Number(id), assignPlanFeatureDto);
  }

  @ApiOperation({ summary: 'Remove feature from plan' })
  @Delete(':id/features/:featureId')
  async removeFeature(@Param('id') id: string, @Param('featureId') featureId: string) {
    return await this.planService.removeFeature(Number(id), featureId);
  }
}
