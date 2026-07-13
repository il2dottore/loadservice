import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CreateAttackDto } from './dtos/create-attack.dto';
import { UpdateAttackDto } from './dtos/update-attack.dto';
import { AttackService } from './attack.service';

@Controller('attacks')
export class AttackController {
  constructor(private readonly attackService: AttackService) { }

  @ApiOperation({ summary: 'Get all attacks' })
  @Get()
  async getAll() {
    return await this.attackService.getAll();
  }

  @ApiOperation({ summary: 'Get attack by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.attackService.getById(Number(id));
  }

  @ApiOperation({ summary: 'Create attack' })
  @Post()
  async create(@Body() createAttackDto: CreateAttackDto) {
    return await this.attackService.create(createAttackDto);
  }

  @ApiOperation({ summary: 'Update attack' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateAttackDto: UpdateAttackDto) {
    return await this.attackService.update(Number(id), updateAttackDto);
  }

  @ApiOperation({ summary: 'Delete attack' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.attackService.delete(Number(id));
  }
}
