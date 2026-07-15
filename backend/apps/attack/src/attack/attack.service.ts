import { ConflictException, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_ATTACK_QUEUE } from '@app/rabbitmq';
import { Attack } from '../entities/attack.entity';
import { AttackRepository } from './attack.repository';
import { CreateAttackDto } from './dtos/create-attack.dto';
import { UpdateAttackDto } from './dtos/update-attack.dto';
import { MethodRepository } from '../method/method.repository';
import { ServerRepository } from '../server/server.repository';
import { RedisService } from '@app/redis/redis.service';
import { AttackGateway } from './attack.gateway';

@Injectable()
export class AttackService {
  constructor(
    private readonly attackRepository: AttackRepository,
    private readonly methodRepository: MethodRepository,
    private readonly serverRepository: ServerRepository,
    private readonly redis: RedisService,
    private readonly attackGateway: AttackGateway,
    @Inject(RABBITMQ_ATTACK_QUEUE) private readonly attackClient: ClientProxy,
  ) { }

  async getAll(): Promise<Attack[]> {
    return await this.attackRepository.find();
  }

  async getById(id: number): Promise<Attack | null> {
    return await this.attackRepository.findOne({ id });
  }

  async create(createAttackDto: CreateAttackDto): Promise<Attack> {
    const attack = await this.attackRepository.insertOne(createAttackDto);
    const reservation = await this.reserveSlot(attack.serverId, attack.duration, attack.id);
    if (!reservation) {
      await this.attackRepository.updateOne({ id: attack.id }, {
        status: 'REJECTED', failureReason: 'No available server slot',
      });
      throw new ConflictException('No available server slot');
    }
    const method = attack.methodId
      ? await this.methodRepository.findOne({ id: attack.methodId })
      : null;
    await firstValueFrom(this.attackClient.emit('attack.fired', {
      ...attack,
      method: method?.name,
      layer: method?.osiLayer,
      slotKey: reservation,
    }));
    return attack;
  }

  private async reserveSlot(serverId: number | null, duration: number, attackId: number) {
    if (!serverId) return 'unassigned';
    const server = await this.serverRepository.findOne({ id: serverId });
    if (!server) return null;
    const ttl = Math.max(1, duration) + 60;
    for (let slot = 0; slot < server.slots; slot++) {
      const key = `attack:server:${server.id}:slot:${slot}`;
      const acquired = await this.redis.raw.set(key, String(attackId), 'EX', ttl, 'NX');
      if (acquired === 'OK') return key;
    }
    return null;
  }

  async update(id: number, updateAttackDto: UpdateAttackDto): Promise<Attack | null> {
    const attack = await this.attackRepository.updateOne({ id }, updateAttackDto);
    if (attack && updateAttackDto.status === 'CANCELLED') {
      await firstValueFrom(this.attackClient.emit('attack.cancel', { id }));
    }
    if (attack) this.attackGateway.emitStatus(attack);
    return attack;
  }

  async updateStatus(id: number, status: UpdateAttackDto['status'], failureReason?: string, slotKey?: string) {
    const result = await this.attackRepository.updateOne({ id }, {
      status,
      failureReason,
      startedAt: status === 'RUNNING' ? new Date() : undefined,
      finishedAt: ['COMPLETED', 'FAILED', 'REJECTED', 'TIMEOUT', 'CANCELLED'].includes(status!)
        ? new Date() : undefined,
    });
    if (slotKey && ['COMPLETED', 'FAILED', 'REJECTED', 'CANCELLED', 'TIMEOUT'].includes(status!)) {
      const owner = await this.redis.raw.get(slotKey);
      if (owner === String(id)) await this.redis.raw.del(slotKey);
    }
    if (result) this.attackGateway.emitStatus(result);
    return result;
  }

  async delete(id: number): Promise<Attack | null> {
    return await this.attackRepository.deleteOne({ id });
  }
}
