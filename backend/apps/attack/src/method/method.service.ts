import { Injectable } from '@nestjs/common';
import { MethodRepository } from './method.repository';
import { CreateMethodDto } from './dtos/create-method.dto';
import { UpdateMethodDto } from './dtos/update-method.dto';
import { Method } from '../entities/method.entity';

@Injectable()
export class MethodService {
  constructor(private readonly methodRepository: MethodRepository) { }

  async getAll(): Promise<Method[]> {
    const rows = await this.methodRepository.findAllWithFeatures();
    return rows.reduce<(Method & { features: { id: string }[] })[]>((methods, row) => {
      let method = methods.find(({ id }) => id === row.methods.id);
      if (!method) {
        method = { ...row.methods, features: [] };
        methods.push(method);
      }
      const feature = row.methods_features
        ? { id: row.methods_features.featureId }
        : null;
      if (feature && !method.features.some(({ id }) => id === feature.id)) {
        method.features.push(feature);
      }
      return methods;
    }, []);
  }

  async getById(id: number): Promise<Method | null> {
    return await this.methodRepository.findOne({ id });
  }

  async create(createMethodDto: CreateMethodDto): Promise<Method> {
    return await this.methodRepository.insertOne(createMethodDto);
  }

  async update(id: number, updateMethodDto: UpdateMethodDto): Promise<Method | null> {
    return await this.methodRepository.updateOne({ id }, updateMethodDto);
  }

  async delete(id: number): Promise<Method | null> {
    return await this.methodRepository.deleteOne({ id });
  }

  async assignFeature(id: number, featureId: string) {
    return this.methodRepository.assignFeature(id, featureId);
  }

  async removeFeature(id: number, featureId: string) {
    return this.methodRepository.removeFeature(id, featureId);
  }
}
