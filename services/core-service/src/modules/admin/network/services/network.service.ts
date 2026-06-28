import { Injectable } from '@nestjs/common';
import { AssignNetworkFeatureDto } from '../dtos/assign-network-feature.dto';
import { CreateNetworkDto } from '../dtos/create-network.dto';
import { UpdateNetworkDto } from '../dtos/update-network.dto';
import { Network } from '../schemas/network.schema';
import { NetworkRepository } from '../network.repository';

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

  async assignFeature(id: number, assignNetworkFeatureDto: AssignNetworkFeatureDto) {
    return await this.networkRepository.assignFeature(id, assignNetworkFeatureDto.featureId);
  }

  async removeFeature(id: number, featureId: number) {
    return await this.networkRepository.removeFeature(id, featureId);
  }
}
