import { Injectable } from '@nestjs/common';
import { Feature } from '../entities/feature.entity';
import { CreateFeatureDto } from './dtos/create-feature.dto';
import { UpdateFeatureDto } from './dtos/update-feature.dto';
import { FeatureRepository } from './feature.repository';

@Injectable()
export class FeatureService {
  constructor(private readonly featureRepository: FeatureRepository) {}

  async getAll(): Promise<Feature[]> {
    return await this.featureRepository.find();
  }

  async getById(id: string): Promise<Feature | null> {
    return await this.featureRepository.findOne({ id });
  }

  async create(createFeatureDto: CreateFeatureDto): Promise<Feature> {
    return await this.featureRepository.insertOne(createFeatureDto);
  }

  async update(
    id: string,
    updateFeatureDto: UpdateFeatureDto,
  ): Promise<Feature | null> {
    return await this.featureRepository.updateOne({ id }, updateFeatureDto);
  }

  async delete(id: string): Promise<Feature | null> {
    return await this.featureRepository.deleteWithAssignments(id);
  }
}
