import { Injectable } from '@nestjs/common';
import { CreateFeatureDto } from '../dtos/create-feature.dto';
import { UpdateFeatureDto } from '../dtos/update-feature.dto';
import { Feature } from '../schemas/feature.schema';
import { FeatureRepository } from '../feature.repository';

@Injectable()
export class FeatureService {
  constructor(private readonly featureRepository: FeatureRepository) { }

  async getAll(): Promise<Feature[]> {
    return await this.featureRepository.find();
  }

  async getById(id: number): Promise<Feature | null> {
    return await this.featureRepository.findOne({ id });
  }

  async create(createFeatureDto: CreateFeatureDto): Promise<Feature> {
    return await this.featureRepository.insertOne(createFeatureDto);
  }

  async update(id: number, updateFeatureDto: UpdateFeatureDto): Promise<Feature | null> {
    return await this.featureRepository.updateOne({ id }, updateFeatureDto);
  }

  async delete(id: number): Promise<Feature | null> {
    return await this.featureRepository.deleteOne({ id });
  }
}
