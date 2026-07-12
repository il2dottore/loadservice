import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from '../dtos/create-ticket.dto';
import { UpdateTicketDto } from '../dtos/update-ticket.dto';
import { Ticket } from '../schemas/ticket.schema';
import { TicketRepository } from '../ticket.repository';

@Injectable()
export class TicketService {
  constructor(private readonly ticketRepository: TicketRepository) { }

  async getAll(): Promise<Ticket[]> {
    return await this.ticketRepository.find();
  }

  async getById(id: number): Promise<Ticket | null> {
    return await this.ticketRepository.findOne({ id });
  }

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    return await this.ticketRepository.insertOne(createTicketDto);
  }

  async update(id: number, updateTicketDto: UpdateTicketDto): Promise<Ticket | null> {
    return await this.ticketRepository.updateOne({ id }, updateTicketDto);
  }

  async delete(id: number): Promise<Ticket | null> {
    return await this.ticketRepository.deleteOne({ id });
  }
}
