import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CreateFeatureDto } from './dtos/create-feature.dto';
import { UpdateFeatureDto } from './dtos/update-feature.dto';
import { FeatureService } from './services/feature.service';

@Controller('admin/features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) { }

  @ApiOperation({ summary: 'Get all features' })
  @Get()
  async getAll() {
    return await this.featureService.getAll();
  }

  @ApiOperation({ summary: 'Get feature by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.featureService.getById(id);
  }

  @ApiOperation({ summary: 'Create feature' })
  @Post()
  async create(@Body() createFeatureDto: CreateFeatureDto) {
    return await this.featureService.create(createFeatureDto);
  }

  @ApiOperation({ summary: 'Update feature' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateFeatureDto: UpdateFeatureDto) {
    return await this.featureService.update(id, updateFeatureDto);
  }

  @ApiOperation({ summary: 'Delete feature' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.featureService.delete(id);
  }
}
