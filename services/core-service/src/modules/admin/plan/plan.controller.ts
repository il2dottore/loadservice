import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CreatePlanDto } from './dtos/create-plan.dto';
import { UpdatePlanDto } from './dtos/update-plan.dto';
import { PlanService } from './services/plan.service';

@Controller('admin/plans')
export class PlanController {
  constructor(private readonly planService: PlanService) { }

  @ApiProperty({ description: 'Get all plans' })
  @Get()
  async getAll() {
    return await this.planService.getAll();
  }

  @ApiProperty({ description: 'Get plan by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.planService.getById(Number(id));
  }

  @ApiProperty({ description: 'Create plan' })
  @Post('create')
  async create(@Body() createPlanDto: CreatePlanDto) {
    return await this.planService.create(createPlanDto);
  }

  @ApiProperty({ description: 'Update plan' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return await this.planService.update(Number(id), updatePlanDto);
  }

  @ApiProperty({ description: 'Delete plan' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.planService.delete(Number(id));
  }
}
