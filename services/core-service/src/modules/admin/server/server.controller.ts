import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CreateServerDto } from './dtos/create-server.dto';
import { UpdateServerDto } from './dtos/update-server.dto';
import { ServerService } from './services/server.service';

@Controller('admin/servers')
export class ServerController {
  constructor(private readonly serverService: ServerService) { }

  @ApiProperty({ description: 'Get all servers' })
  @Get()
  async getAll() {
    return await this.serverService.getAll();
  }

  @ApiProperty({ description: 'Get server by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.serverService.getById(Number(id));
  }

  @ApiProperty({ description: 'Create server' })
  @Post('create')
  async create(@Body() createServerDto: CreateServerDto) {
    return await this.serverService.create(createServerDto);
  }

  @ApiProperty({ description: 'Update server' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateServerDto: UpdateServerDto) {
    return await this.serverService.update(Number(id), updateServerDto);
  }

  @ApiProperty({ description: 'Delete server' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.serverService.delete(Number(id));
  }
}
