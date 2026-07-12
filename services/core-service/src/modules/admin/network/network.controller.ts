import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AssignNetworkServerDto } from './dtos/assign-network-server.dto';
import { CreateNetworkDto } from './dtos/create-network.dto';
import { UpdateNetworkDto } from './dtos/update-network.dto';
import { NetworkService } from './services/network.service';

@Controller('admin/networks')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) { }

  @ApiOperation({ summary: 'Get all networks' })
  @Get()
  async getAll() {
    return await this.networkService.getAll();
  }

  @ApiOperation({ summary: 'Get network by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.networkService.getById(Number(id));
  }

  @ApiOperation({ summary: 'Create network' })
  @Post('create')
  async create(@Body() createNetworkDto: CreateNetworkDto) {
    return await this.networkService.create(createNetworkDto);
  }

  @ApiOperation({ summary: 'Update network' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateNetworkDto: UpdateNetworkDto) {
    return await this.networkService.update(Number(id), updateNetworkDto);
  }

  @ApiOperation({ summary: 'Delete network' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.networkService.delete(Number(id));
  }

  @ApiOperation({ summary: 'Assign server to network' })
  @Post(':id/servers')
  async assignServer(@Param('id') id: string, @Body() assignNetworkServerDto: AssignNetworkServerDto) {
    return await this.networkService.assignServer(Number(id), assignNetworkServerDto);
  }

  @ApiOperation({ summary: 'Remove server from network' })
  @Delete(':id/servers/:serverId')
  async removeServer(@Param('id') id: string, @Param('serverId') serverId: string) {
    return await this.networkService.removeServer(Number(id), Number(serverId));
  }
}
