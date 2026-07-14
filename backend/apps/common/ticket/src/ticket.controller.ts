import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { UpdateTicketDto } from './dtos/update-ticket.dto';
import { TicketService } from './services/ticket.service';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) { }

  @ApiOperation({ summary: 'Get all tickets' })
  @Get()
  async getAll() {
    return await this.ticketService.getAll();
  }

  @ApiOperation({ summary: 'Get ticket by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.ticketService.getById(Number(id));
  }

  @ApiOperation({ summary: 'Create ticket' })
  @Post()
  async create(@Body() createTicketDto: CreateTicketDto) {
    return await this.ticketService.create(createTicketDto);
  }

  @ApiOperation({ summary: 'Update ticket' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return await this.ticketService.update(Number(id), updateTicketDto);
  }

  @ApiOperation({ summary: 'Delete ticket' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.ticketService.delete(Number(id));
  }
}
