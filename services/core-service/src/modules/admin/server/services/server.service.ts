import { Injectable } from '@nestjs/common';
import { CreateServerDto } from '../dtos/create-server.dto';
import { UpdateServerDto } from '../dtos/update-server.dto';
import { Server } from '../schemas/server.schema';
import { ServerRepository } from '../server.repository';

@Injectable()
export class ServerService {
  constructor(private readonly serverRepository: ServerRepository) { }

  private mapServerWithNetworks(rows: Awaited<ReturnType<ServerRepository['queryServerInfo']>>) {
    const firstRow = rows[0];
    if (!firstRow) {
      return null;
    }

    const networks = rows
      .map((row) => row.networks)
      .filter((network): network is NonNullable<typeof network> => Boolean(network))
      .filter((network, index, list) => list.findIndex((item) => item.id === network.id) === index);

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
      .filter((server): server is NonNullable<typeof server> => Boolean(server));
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

  async update(id: number, updateServerDto: UpdateServerDto): Promise<Server | null> {
    return await this.serverRepository.updateOne({ id }, updateServerDto);
  }

  async delete(id: number): Promise<Server | null> {
    return await this.serverRepository.deleteOne({ id });
  }
}
