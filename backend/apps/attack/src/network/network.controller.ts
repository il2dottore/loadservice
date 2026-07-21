import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AssignNetworkServerDto } from './dtos/assign-network-server.dto';
import { CreateNetworkDto } from './dtos/create-network.dto';
import { UpdateNetworkDto } from './dtos/update-network.dto';
import { NetworkService } from './network.service';
import { JwtAuthGuard, Role, RolesGuard } from '@app/auth';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('networks')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @ApiOperation({ summary: 'Get all networks' })
  @Get()
  async getAll() {
    return await this.networkService.getAll();
  }

  @Post('allowed-servers')
  @ApiOperation({ summary: 'Get servers allowed by network feature access' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        featureIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['premium-network'],
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Servers from unrestricted or matching networks',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'EU server 1' },
          address: { type: 'string', example: '192.0.2.10' },
          slots: { type: 'integer', example: 10 },
        },
      },
    },
  })
  async getAllowedServers(@Body() body: { featureIds?: string[] }) {
    return this.networkService.getAllowedServers(body.featureIds ?? []);
  }

  @ApiOperation({ summary: 'Get network by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.networkService.getById(Number(id));
  }

  @ApiOperation({ summary: 'Create network' })
  @Post()
  @Role('ADMINISTRATOR')
  async create(@Body() createNetworkDto: CreateNetworkDto) {
    return await this.networkService.create(createNetworkDto);
  }

  @ApiOperation({ summary: 'Update network' })
  @Put(':id')
  @Role('ADMINISTRATOR')
  async update(
    @Param('id') id: string,
    @Body() updateNetworkDto: UpdateNetworkDto,
  ) {
    return await this.networkService.update(Number(id), updateNetworkDto);
  }

  @ApiOperation({ summary: 'Delete network' })
  @Delete(':id')
  @Role('ADMINISTRATOR')
  async delete(@Param('id') id: string) {
    return await this.networkService.delete(Number(id));
  }

  @ApiOperation({ summary: 'Assign server to network' })
  @Post(':id/servers')
  @Role('ADMINISTRATOR')
  async assignServer(
    @Param('id') id: string,
    @Body() assignNetworkServerDto: AssignNetworkServerDto,
  ) {
    return await this.networkService.assignServer(
      Number(id),
      assignNetworkServerDto,
    );
  }

  @ApiOperation({ summary: 'Remove server from network' })
  @Delete(':id/servers/:serverId')
  @Role('ADMINISTRATOR')
  async removeServer(
    @Param('id') id: string,
    @Param('serverId') serverId: string,
  ) {
    return await this.networkService.removeServer(Number(id), Number(serverId));
  }

  @Get(':id/features')
  async getFeatures(@Param('id') id: string) {
    return this.networkService.getFeatures(Number(id));
  }

  @Post(':id/features/:featureId')
  @Role('ADMINISTRATOR')
  async assignFeature(
    @Param('id') id: string,
    @Param('featureId') featureId: string,
  ) {
    return this.networkService.assignFeature(Number(id), featureId);
  }

  @Delete(':id/features/:featureId')
  @Role('ADMINISTRATOR')
  async removeFeature(
    @Param('id') id: string,
    @Param('featureId') featureId: string,
  ) {
    return this.networkService.removeFeature(Number(id), featureId);
  }
}
