import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CreateMethodDto } from './dtos/create-method.dto';
import { UpdateMethodDto } from './dtos/update-method.dto';
import { MethodService } from './method.service';

@Controller('methods')
export class MethodController {
  constructor(private readonly methodService: MethodService) {}

  @ApiOperation({ summary: 'Get all methods' })
  @Get()
  async getAll() {
    return await this.methodService.getAll();
  }

  @ApiOperation({ summary: 'Get method by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.methodService.getById(Number(id));
  }

  @ApiOperation({ summary: 'Create method' })
  @Post()
  async create(@Body() createMethodDto: CreateMethodDto) {
    return await this.methodService.create(createMethodDto);
  }

  @ApiOperation({ summary: 'Update method' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMethodDto: UpdateMethodDto,
  ) {
    return await this.methodService.update(Number(id), updateMethodDto);
  }

  @ApiOperation({ summary: 'Delete method' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.methodService.delete(Number(id));
  }

  @Post(':id/features/:featureId')
  async assignFeature(
    @Param('id') id: string,
    @Param('featureId') featureId: string,
  ) {
    return this.methodService.assignFeature(Number(id), featureId);
  }

  @Delete(':id/features/:featureId')
  async removeFeature(
    @Param('id') id: string,
    @Param('featureId') featureId: string,
  ) {
    return this.methodService.removeFeature(Number(id), featureId);
  }
}
