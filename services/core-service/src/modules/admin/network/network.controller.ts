import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AssignNetworkFeatureDto } from './dtos/assign-network-feature.dto';
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

  @ApiOperation({ summary: 'Assign feature to network' })
  @Post(':id/features')
  async assignFeature(@Param('id') id: string, @Body() assignNetworkFeatureDto: AssignNetworkFeatureDto) {
    return await this.networkService.assignFeature(Number(id), assignNetworkFeatureDto);
  }

  @ApiOperation({ summary: 'Remove feature from network' })
  @Delete(':id/features/:featureId')
  async removeFeature(@Param('id') id: string, @Param('featureId') featureId: string) {
    return await this.networkService.removeFeature(Number(id), Number(featureId));
  }
}
