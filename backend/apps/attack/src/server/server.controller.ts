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
import { ApiOperation } from '@nestjs/swagger';
import { CreateServerDto } from './dtos/create-server.dto';
import { UpdateServerDto } from './dtos/update-server.dto';
import { ServerService } from './server.service';
import { JwtAuthGuard, RolesGuard, Role } from '@app/auth';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('servers')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

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

  @ApiOperation({ summary: 'Get attack node status for all servers' })
  @Get('status')
  async getStatuses() {
    return this.serverService.getStatuses();
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
  @Role('ADMINISTRATOR')
  async create(@Body() createServerDto: CreateServerDto) {
    return await this.serverService.create(createServerDto);
  }

  @ApiOperation({ summary: 'Update server' })
  @Put(':id')
  @Role('ADMINISTRATOR')
  async update(
    @Param('id') id: string,
    @Body() updateServerDto: UpdateServerDto,
  ) {
    return await this.serverService.update(Number(id), updateServerDto);
  }

  @ApiOperation({ summary: 'Delete server' })
  @Delete(':id')
  @Role('ADMINISTRATOR')
  async delete(@Param('id') id: string) {
    return await this.serverService.delete(Number(id));
  }
}
