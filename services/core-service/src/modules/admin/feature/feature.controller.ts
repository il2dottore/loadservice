import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CreateFeatureDto } from './dtos/create-feature.dto';
import { UpdateFeatureDto } from './dtos/update-feature.dto';
import { FeatureService } from './services/feature.service';

@Controller('admin/features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) { }

  @ApiProperty({ description: 'Get all features' })
  @Get()
  async getAll() {
    return await this.featureService.getAll();
  }

  @ApiProperty({ description: 'Get feature by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.featureService.getById(Number(id));
  }

  @ApiProperty({ description: 'Create feature' })
  @Post('create')
  async create(@Body() createFeatureDto: CreateFeatureDto) {
    return await this.featureService.create(createFeatureDto);
  }

  @ApiProperty({ description: 'Update feature' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateFeatureDto: UpdateFeatureDto) {
    return await this.featureService.update(Number(id), updateFeatureDto);
  }

  @ApiProperty({ description: 'Delete feature' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.featureService.delete(Number(id));
  }
}
