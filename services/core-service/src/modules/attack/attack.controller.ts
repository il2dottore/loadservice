import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAttackDto } from './dtos/create-attack.dto';
import { UpdateAttackDto } from './dtos/update-attack.dto';
import { AttackService } from './services/attack.service';

@Controller('attacks')
export class AttackController {
  constructor(private readonly attackService: AttackService) { }

  @ApiProperty({ description: 'Get all attacks' })
  @Get()
  async getAll() {
    return await this.attackService.getAll();
  }

  @ApiProperty({ description: 'Get attack by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.attackService.getById(Number(id));
  }

  @ApiProperty({ description: 'Create attack' })
  @Post('create')
  async create(@Body() createAttackDto: CreateAttackDto) {
    return await this.attackService.create(createAttackDto);
  }

  @ApiProperty({ description: 'Update attack' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateAttackDto: UpdateAttackDto) {
    return await this.attackService.update(Number(id), updateAttackDto);
  }

  @ApiProperty({ description: 'Delete attack' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.attackService.delete(Number(id));
  }
}
