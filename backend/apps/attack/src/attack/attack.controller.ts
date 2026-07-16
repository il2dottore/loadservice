import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateAttackDto } from './dtos/create-attack.dto';
import { UpdateAttackDto } from './dtos/update-attack.dto';
import { AttackService } from './attack.service';
import { JwtAuthGuard, Role, RolesGuard } from '@app/auth';

@Controller('attacks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Role('ADMINISTRATOR')
export class AttackController {
  constructor(private readonly attackService: AttackService) { }


  @ApiOperation({ summary: 'Get all attacks' })
  @Get()
  async getAll() {
    try {
      return await this.attackService.getAll();
    } catch (exception) {
      console.log(exception);
    }
  }

  @ApiOperation({ summary: 'Get attack by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.attackService.getById(Number(id));
  }

  @ApiOperation({ summary: 'Create attack' })
  @Post()
  async create(@Req() request: { user: { sub: string }; headers: { authorization?: string } }, @Body() createAttackDto: CreateAttackDto) {
    return await this.attackService.create(
      { ...createAttackDto, userId: request.user.sub },
      request.headers.authorization ?? '',
    );
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
