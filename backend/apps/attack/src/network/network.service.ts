import { Injectable } from '@nestjs/common';
import { AssignNetworkServerDto } from './dtos/assign-network-server.dto';
import { CreateNetworkDto } from './dtos/create-network.dto';
import { UpdateNetworkDto } from './dtos/update-network.dto';
import { Network } from '../entities/network.entity';
import { NetworkRepository } from './network.repository';

@Injectable()
export class NetworkService {
  constructor(private readonly networkRepository: NetworkRepository) { }

  async getAll(): Promise<Network[]> {
    return await this.networkRepository.find();
  }

  async getById(id: number) {
    return await this.networkRepository.queryNetworkInfo(id);
  }

  async create(createNetworkDto: CreateNetworkDto): Promise<Network> {
    return await this.networkRepository.insertOne(createNetworkDto);
  }

  async update(id: number, updateNetworkDto: UpdateNetworkDto): Promise<Network | null> {
    return await this.networkRepository.updateOne({ id }, updateNetworkDto);
  }

  async delete(id: number): Promise<Network | null> {
    return await this.networkRepository.deleteOne({ id });
  }

  async assignServer(id: number, assignNetworkServerDto: AssignNetworkServerDto) {
    return await this.networkRepository.assignServer(id, assignNetworkServerDto.serverId);
  }

  async removeServer(id: number, serverId: number) {
    return await this.networkRepository.removeServer(id, serverId);
  }
}
