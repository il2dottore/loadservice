import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AssignPlanFeatureDto } from './dtos/assign-plan-feature.dto';
import { CreatePlanDto } from './dtos/create-plan.dto';
import { UpdatePlanDto } from './dtos/update-plan.dto';
import { PlanService } from './plan.service';
import { JwtAuthGuard, Role, RolesGuard } from '@app/auth';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @ApiOperation({ summary: 'Get all plans' })
  @Get()
  async getAll() {
    return await this.planService.getAll();
  }

  @ApiOperation({ summary: 'Batch get all plans with features' })
  @Post('batch')
  async batch(@Body() body: number[] | { planIds: number[] }) {
    const planIds = Array.isArray(body) ? body : body.planIds;
    return await this.planService.batch(planIds.map(Number));
  }

  @ApiOperation({ summary: 'Get plan by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.planService.getById(Number(id));
  }

  @ApiOperation({ summary: 'Create plan' })
  @Role('ADMINISTRATOR')
  @Post()
  async create(@Body() createPlanDto: CreatePlanDto) {
    return await this.planService.create(createPlanDto);
  }

  @ApiOperation({ summary: 'Update plan' })
  @Role('ADMINISTRATOR')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return await this.planService.update(Number(id), updatePlanDto);
  }

  @ApiOperation({ summary: 'Delete plan' })
  @Role('ADMINISTRATOR')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.planService.delete(Number(id));
  }

  @ApiOperation({ summary: 'Assign feature to plan' })
  @Role('ADMINISTRATOR')
  @Post(':id/features')
  async assignFeature(
    @Param('id') id: string,
    @Body() assignPlanFeatureDto: AssignPlanFeatureDto,
  ) {
    return await this.planService.assignFeature(
      Number(id),
      assignPlanFeatureDto,
    );
  }

  @ApiOperation({ summary: 'Remove feature from plan' })
  @Delete(':id/features/:featureId')
  @Role('ADMINISTRATOR')
  async removeFeature(
    @Param('id') id: string,
    @Param('featureId') featureId: string,
  ) {
    return await this.planService.removeFeature(Number(id), featureId);
  }
}
