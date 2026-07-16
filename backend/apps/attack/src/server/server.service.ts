import { Injectable } from '@nestjs/common';
import { CreateServerDto } from './dtos/create-server.dto';
import { UpdateServerDto } from './dtos/update-server.dto';
import { ServerRepository } from './server.repository';
import { Server } from '../entities/server.entity';
import { RedisService } from '@app/redis/redis.service';

@Injectable()
export class ServerService {
  constructor(
    private readonly serverRepository: ServerRepository,
    private readonly redis: RedisService,
  ) {}

  async getStatuses() {
    const servers = await this.getAll();
    return Promise.all(
      servers.map(async (server) => {
        const key = `server:status:${server.id}`;
        const cached = await this.redis.getJson<{
          online: boolean;
          cpu: number;
          memory: number;
          active: number;
        }>(key);
        if (cached) return { id: server.id, ...cached };

        let online = false;
        let cpu = 0;
        let memory = 0;
        let active = 0;
        try {
          const response = await fetch(
            `${process.env.ATTACK_NODE_PROTOCOL ?? 'http'}://${server.address}:${process.env.ATTACK_NODE_PORT ?? '2005'}/health`,
            { signal: AbortSignal.timeout(3000) },
          );
          online = response.ok;
          if (online) {
            const health = (await response.json()) as {
              cpu?: number;
              memory?: number;
              active?: number;
            };
            cpu = health.cpu ?? 0;
            memory = health.memory ?? 0;
            active = health.active ?? 0;
          }
        } catch {
          /* node is offline */
        }
        await this.redis.setJson(key, { online, cpu, memory, active }, 15);
        return {
          id: server.id,
          online,
          cpu,
          memory,
          active,
          maxSlots: server.slots,
        };
      }),
    );
  }

  async getAllowedServerAddresses(featureIds: string[]) {
    const rows = await this.serverRepository.queryAllowedServers(featureIds);
    return rows.map(({ address }) => address);
  }

  private mapServerWithNetworks(
    rows: Awaited<ReturnType<ServerRepository['queryServerInfo']>>,
  ) {
    const firstRow = rows[0];
    if (!firstRow) {
      return null;
    }

    const networks = rows
      .map((row) => row.networks)
      .filter((network): network is NonNullable<typeof network> =>
        Boolean(network),
      )
      .filter(
        (network, index, list) =>
          list.findIndex((item) => item.id === network.id) === index,
      );

    return {
      ...firstRow.servers,
      networks,
    };
  }

  async getAll(): Promise<Server[]> {
    return await this.serverRepository.find();
  }

  async getAllDetails() {
    const rows = await this.serverRepository.queryServersInfo();
    const grouped = new Map<number, typeof rows>();

    for (const row of rows) {
      const currentRows = grouped.get(row.servers.id) ?? [];
      currentRows.push(row);
      grouped.set(row.servers.id, currentRows);
    }

    return Array.from(grouped.values())
      .map((serverRows) => this.mapServerWithNetworks(serverRows))
      .filter((server): server is NonNullable<typeof server> =>
        Boolean(server),
      );
  }

  async getById(id: number) {
    return await this.serverRepository.queryServerInfo(id);
  }

  async getDetailsById(id: number) {
    const rows = await this.serverRepository.queryServerInfo(id);
    return this.mapServerWithNetworks(rows);
  }

  async create(createServerDto: CreateServerDto): Promise<Server> {
    return await this.serverRepository.insertOne(createServerDto);
  }

  async update(
    id: number,
    updateServerDto: UpdateServerDto,
  ): Promise<Server | null> {
    return await this.serverRepository.updateOne({ id }, updateServerDto);
  }

  async delete(id: number): Promise<Server | null> {
    return await this.serverRepository.deleteOne({ id });
  }
}
