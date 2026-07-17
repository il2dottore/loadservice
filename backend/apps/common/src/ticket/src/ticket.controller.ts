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
import { JwtAuthGuard, Permission, PermissionsGuard } from '@app/auth';
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
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  private actor(request: RequestWithUser) {
    return {
      id: request.user.sub,
      permissions:
        request.user.details?.roles_permissions
          ?.map((p) => p.permission_id)
          .filter((p): p is string => Boolean(p)) ?? [],
    };
  }

  @Get()
  @ApiOperation({ summary: 'List tickets visible to the current user' })
  getAll(
    @Query('scope') scope: string | undefined,
    @Req() request: RequestWithUser,
  ) {
    return this.ticketService.getAll(this.actor(request), scope === 'admin');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket and its replies' })
  getById(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.ticketService.getById(Number(id), this.actor(request));
  }

  @Post()
  @ApiOperation({ summary: 'Create a support ticket' })
  create(@Body() dto: CreateTicketDto, @Req() request: RequestWithUser) {
    return this.ticketService.create(dto, request.user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a ticket (manager only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
    @Req() request: RequestWithUser,
  ) {
    return this.ticketService.update(Number(id), dto, this.actor(request));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a ticket (manager only)' })
  delete(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.ticketService.remove(Number(id), this.actor(request));
  }

  @Post(':id/claim')
  @Permission('ticket:reply', 'ticket:manage')
  @ApiOperation({ summary: 'Claim an unassigned ticket' })
  claim(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.ticketService.claim(Number(id), this.actor(request));
  }

  @Post(':id/release')
  @Permission('ticket:reply', 'ticket:manage')
  @ApiOperation({ summary: 'Release an assigned ticket' })
  release(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.ticketService.release(Number(id), this.actor(request));
  }

  @Post(':id/replies')
  @ApiOperation({ summary: 'Reply to a claimed ticket' })
  reply(
    @Param('id') id: string,
    @Body() dto: CreateReplyDto,
    @Req() request: RequestWithUser,
  ) {
    return this.ticketService.addReply(Number(id), dto, this.actor(request));
  }

  @Patch(':id/status')
  @Permission('ticket:reply', 'ticket:manage')
  @ApiOperation({ summary: 'Change ticket status' })
  status(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @Req() request: RequestWithUser,
  ) {
    return this.ticketService.updateStatus(
      Number(id),
      dto.status,
      this.actor(request),
    );
  }
}
