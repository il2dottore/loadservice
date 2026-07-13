import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CreateServerDto } from './dtos/create-server.dto';
import { UpdateServerDto } from './dtos/update-server.dto';
import { ServerService } from './services/server.service';

@Controller('admin/servers')
export class ServerController {
  constructor(private readonly serverService: ServerService) { }

  @ApiOperation({ summary: 'Get all servers' })
  @Get()
  async getAll() {
    return await this.serverService.getAll();
  }

  @ApiOperation({ summary: 'Get all servers with network details' })
  @Get('details')
  async getAllDetails() {
    return await this.serverService.getAllDetails();
  }

  @ApiOperation({ summary: 'Get server by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.serverService.getById(Number(id));
  }

  @ApiOperation({ summary: 'Get server details by ID' })
  @Get(':id/details')
  async getDetailsById(@Param('id') id: string) {
    return await this.serverService.getDetailsById(Number(id));
  }

  @ApiOperation({ summary: 'Create server' })
  @Post()
  async create(@Body() createServerDto: CreateServerDto) {
    return await this.serverService.create(createServerDto);
  }

  @ApiOperation({ summary: 'Update server' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateServerDto: UpdateServerDto) {
    return await this.serverService.update(Number(id), updateServerDto);
  }

  @ApiOperation({ summary: 'Delete server' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.serverService.delete(Number(id));
  }
}
