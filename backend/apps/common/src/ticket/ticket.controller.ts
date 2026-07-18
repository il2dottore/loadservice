import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/auth';
import { UseGuards } from '@nestjs/common';
import { CreateReplyDto } from './dtos/create-reply.dto';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { UpdateTicketDto } from './dtos/update-ticket.dto';
import { UpdateStatusDto } from './dtos/update-status.dto';
import { TicketStatusValue } from './schemas/ticket.entity';
import { TicketService } from './services/ticket.service';

type RequestWithUser = {
  user: {
    sub: string;
    details?: { roles_permissions?: { permission_id?: string }[] };
  };
};

@Controller('tickets')
@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  @ApiOperation({ summary: 'List tickets visible to the current user' })
  async getAll(
    @Query('scope') scope: string | undefined,
    @Req() request: RequestWithUser,
  ) {
    return this.ticketService.getAll(
      await this.ticketService.getActor(request.user.sub),
      scope === 'admin',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket and its replies' })
  async getById(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.ticketService.getById(
      Number(id),
      await this.ticketService.getActor(request.user.sub),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a support ticket' })
  create(@Body() dto: CreateTicketDto, @Req() request: RequestWithUser) {
    return this.ticketService.create(dto, request.user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a ticket (manager only)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
    @Req() request: RequestWithUser,
  ) {
    return this.ticketService.update(
      Number(id),
      dto,
      await this.ticketService.getActor(request.user.sub),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a ticket (manager only)' })
  async delete(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.ticketService.remove(
      Number(id),
      await this.ticketService.getActor(request.user.sub),
    );
  }

  @Post(':id/claim')
  @ApiOperation({ summary: 'Claim an unassigned ticket' })
  async claim(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.ticketService.claim(
      Number(id),
      await this.ticketService.getActor(request.user.sub),
    );
  }

  @Post(':id/release')
  @ApiOperation({ summary: 'Release an assigned ticket' })
  async release(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.ticketService.release(
      Number(id),
      await this.ticketService.getActor(request.user.sub),
    );
  }

  @Post(':id/replies')
  @ApiOperation({ summary: 'Reply to a claimed ticket' })
  async reply(
    @Param('id') id: string,
    @Body() dto: CreateReplyDto,
    @Req() request: RequestWithUser,
  ) {
    return this.ticketService.addReply(
      Number(id),
      dto,
      await this.ticketService.getActor(request.user.sub),
    );
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change ticket status' })
  async status(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @Req() request: RequestWithUser,
  ) {
    return this.ticketService.updateStatus(
      Number(id),
      dto.status,
      await this.ticketService.getActor(request.user.sub),
    );
  }
}
