import { Injectable } from '@nestjs/common';
import { News } from '../entities/news.entity';
import { CreateNewsDto } from './dtos/create-news.dto';
import { UpdateNewsDto } from './dtos/update-news.dto';
import { NewsRepository } from './news.repository';

@Injectable()
export class NewsService {
  constructor(private readonly newsRepository: NewsRepository) {}

  async getAll(page = 1, perPage = 10) {
    return await this.newsRepository.findPage(page, perPage);
  }

  async getById(id: number): Promise<News | null> {
    return await this.newsRepository.findOne({ id });
  }

  async create(createNewsDto: CreateNewsDto, authorId: string): Promise<News> {
    return await this.newsRepository.insertOne({ ...createNewsDto, authorId });
  }

  async update(id: number, updateNewsDto: UpdateNewsDto): Promise<News | null> {
    return await this.newsRepository.updateOne({ id }, updateNewsDto);
  }

  async delete(id: number): Promise<News | null> {
    return await this.newsRepository.deleteOne({ id });
  }
}
