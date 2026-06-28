import { Injectable } from '@nestjs/common';
import { CreateServerDto } from '../dtos/create-server.dto';
import { UpdateServerDto } from '../dtos/update-server.dto';
import { Server } from '../schemas/server.schema';
import { ServerRepository } from '../server.repository';

@Injectable()
export class ServerService {
  constructor(private readonly serverRepository: ServerRepository) { }

  async getAll(): Promise<Server[]> {
    return await this.serverRepository.find();
  }

  async getById(id: number) {
    return await this.serverRepository.queryServerInfo(id);
  }

  async create(createServerDto: CreateServerDto): Promise<Server> {
    return await this.serverRepository.insertOne(createServerDto);
  }

  async update(id: number, updateServerDto: UpdateServerDto): Promise<Server | null> {
    return await this.serverRepository.updateOne({ id }, updateServerDto);
  }

  async delete(id: number): Promise<Server | null> {
    return await this.serverRepository.deleteOne({ id });
  }
}
