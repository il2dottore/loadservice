import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReplyDto } from '../dtos/create-reply.dto';
import { CreateTicketDto } from '../dtos/create-ticket.dto';
import { UpdateTicketDto } from '../dtos/update-ticket.dto';
import { TicketStatusValue } from '../schemas/ticket.entity';
import { TicketRepository } from '../ticket.repository';
import { UserService } from '../../../auth/src/user/user.service';
import { TicketGateway } from '../ticket.gateway';

type Actor = { id: string; permissions: string[] };
const REPLY = 'ticket:reply';
const MANAGE = 'ticket:manage';

@Injectable()
export class TicketService {
  constructor(
    private readonly repository: TicketRepository,
    private readonly userService: UserService,
    private readonly gateway: TicketGateway,
  ) {}

  async getActor(userId: string): Promise<Actor> {
    const details = await this.userService.getUserDetailsById(userId);
    return {
      id: userId,
      permissions: details.roles_permissions
        .map((permission) => permission.permission_id)
        .filter((permission): permission is string => Boolean(permission)),
    };
  }

  private can(actor: Actor, permission: string) {
    return actor.permissions.includes(permission);
  }
  private async getVisible(id: number, actor: Actor) {
    const ticket = await this.repository.findOne({ id });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (
      !this.can(actor, REPLY) &&
      !this.can(actor, MANAGE) &&
      ticket.senderId !== actor.id
    )
      throw new ForbiddenException();
    return ticket;
  }

  private ensureMutable(status: TicketStatusValue) {
    if (status === 'SOLVED' || status === 'CLOSED') {
      throw new ConflictException('This ticket is no longer mutable');
    }
  }

  getAll(actor: Actor, adminScope = false) {
    if (!adminScope) {
      return this.repository.findVisible(actor.id, false, false);
    }
    if (!this.can(actor, REPLY) && !this.can(actor, MANAGE)) {
      throw new ForbiddenException();
    }
    return this.repository.findVisible(
      actor.id,
      this.can(actor, REPLY),
      this.can(actor, MANAGE),
    );
  }
  async getById(id: number, actor: Actor) {
    const ticket = await this.getVisible(id, actor);
    return { ...ticket, replies: await this.repository.findReplies(id) };
  }
  async create(dto: CreateTicketDto, actorId: string) {
    const ticket = await this.repository.insertOne({ ...dto, senderId: actorId });
    this.gateway.emitUpdated(ticket.id, 'created');
    return ticket;
  }

  async update(id: number, dto: UpdateTicketDto, actor: Actor) {
    const current = await this.getVisible(id, actor);
    this.ensureMutable(current.status);
    if (!this.can(actor, MANAGE) && current.senderId !== actor.id) {
      throw new ForbiddenException();
    }
    const ticket = await this.repository.updateOne(
      { id },
      { ...dto, updatedAt: new Date() },
    );
    if (!ticket) throw new NotFoundException('Ticket not found');
    this.gateway.emitUpdated(ticket.id, 'changed');
    return ticket;
  }

  async remove(id: number, actor: Actor) {
    const current = await this.getVisible(id, actor);
    this.ensureMutable(current.status);
    if (!this.can(actor, MANAGE) && current.senderId !== actor.id) {
      throw new ForbiddenException();
    }
    const ticket = await this.repository.deleteOne({ id });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async claim(id: number, actor: Actor) {
    if (!this.can(actor, REPLY) && !this.can(actor, MANAGE))
      throw new ForbiddenException();
    const current = await this.getVisible(id, actor);
    this.ensureMutable(current.status);
    const ticket = await this.repository.claim(id, actor.id);
    if (!ticket)
      throw new ConflictException(
        'Ticket is already claimed or cannot be claimed',
      );
    this.gateway.emitUpdated(ticket.id, 'changed');
    return ticket;
  }

  async release(id: number, actor: Actor) {
    if (!this.can(actor, REPLY) && !this.can(actor, MANAGE))
      throw new ForbiddenException();
    const current = await this.getVisible(id, actor);
    this.ensureMutable(current.status);
    const ticket = await this.repository.release(
      id,
      actor.id,
      this.can(actor, MANAGE),
    );
    if (!ticket)
      throw new ForbiddenException(
        'Only the assigned support can release this ticket',
      );
    this.gateway.emitUpdated(ticket.id, 'changed');
    return ticket;
  }

  async updateStatus(id: number, status: TicketStatusValue, actor: Actor) {
    const ticket = await this.getVisible(id, actor);
    this.ensureMutable(ticket.status);
    const manager = this.can(actor, MANAGE);
    if (
      !manager &&
      (!this.can(actor, REPLY) || ticket.assignedSupportId !== actor.id)
    )
      throw new ForbiddenException();
    const updated = await this.repository.updateOne(
      { id },
      { status, updatedAt: new Date() },
    );
    if (!updated) throw new NotFoundException('Ticket not found');
    this.gateway.emitUpdated(updated.id, 'changed');
    return updated;
  }

  async addReply(id: number, dto: CreateReplyDto, actor: Actor) {
    const ticket = await this.getVisible(id, actor);
    this.ensureMutable(ticket.status);
    const isOwner = ticket.senderId === actor.id;
    const isAssignedSupport =
      this.can(actor, REPLY) && ticket.assignedSupportId === actor.id;
    if (!isOwner && !this.can(actor, MANAGE) && !isAssignedSupport)
      throw new ForbiddenException();
    const reply = await this.repository.addReply(id, actor.id, dto.content);
    this.gateway.emitUpdated(id, 'replied');
    return reply;
  }
}
