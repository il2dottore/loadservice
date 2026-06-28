import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CreateMethodDto } from './dtos/create-method.dto';
import { UpdateMethodDto } from './dtos/update-method.dto';
import { MethodService } from './services/method.service';

@Controller('admin/methods')
export class MethodController {
  constructor(private readonly methodService: MethodService) { }

  @ApiProperty({ description: 'Get all methods' })
  @Get()
  async getAll() {
    return await this.methodService.getAll();
  }

  @ApiProperty({ description: 'Get method by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.methodService.getById(Number(id));
  }

  @ApiProperty({ description: 'Create method' })
  @Post('create')
  async create(@Body() createMethodDto: CreateMethodDto) {
    return await this.methodService.create(createMethodDto);
  }

  @ApiProperty({ description: 'Update method' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateMethodDto: UpdateMethodDto) {
    return await this.methodService.update(Number(id), updateMethodDto);
  }

  @ApiProperty({ description: 'Delete method' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.methodService.delete(Number(id));
  }
}
