import { Injectable } from '@nestjs/common';
import { Method } from '../schemas/method.schema';
import { MethodRepository } from '../method.repository';
import { CreateMethodDto } from '../dtos/create-method.dto';
import { UpdateMethodDto } from '../dtos/update-method.dto';

@Injectable()
export class MethodService {
  constructor(private readonly methodRepository: MethodRepository) { }

  async getAll(): Promise<Method[]> {
    return await this.methodRepository.find();
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
}
