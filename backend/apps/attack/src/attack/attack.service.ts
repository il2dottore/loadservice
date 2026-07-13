import { Injectable } from '@nestjs/common';
import { Attack } from '../entities/attack.entity';
import { AttackRepository } from './attack.repository';
import { CreateAttackDto } from './dtos/create-attack.dto';
import { UpdateAttackDto } from './dtos/update-attack.dto';

@Injectable()
export class AttackService {
  constructor(private readonly attackRepository: AttackRepository) { }

  async getAll(): Promise<Attack[]> {
    return await this.attackRepository.find();
  }

  async getById(id: number): Promise<Attack | null> {
    return await this.attackRepository.findOne({ id });
  }

  async create(createAttackDto: CreateAttackDto): Promise<Attack> {
    return await this.attackRepository.insertOne(createAttackDto);
  }

  async update(id: number, updateAttackDto: UpdateAttackDto): Promise<Attack | null> {
    return await this.attackRepository.updateOne({ id }, updateAttackDto);
  }

  async delete(id: number): Promise<Attack | null> {
    return await this.attackRepository.deleteOne({ id });
  }
}
