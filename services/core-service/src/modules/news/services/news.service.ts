import { Injectable } from '@nestjs/common';
import { CreateNewsDto } from '../dtos/create-news.dto';
import { UpdateNewsDto } from '../dtos/update-news.dto';
import { News } from '../schemas/news.schema';
import { NewsRepository } from '../news.repository';

@Injectable()
export class NewsService {
  constructor(private readonly newsRepository: NewsRepository) { }

  async getAll(): Promise<News[]> {
    return await this.newsRepository.find();
  }

  async getById(id: number): Promise<News | null> {
    return await this.newsRepository.findOne({ id });
  }

  async create(createNewsDto: CreateNewsDto): Promise<News> {
    return await this.newsRepository.insertOne(createNewsDto);
  }

  async update(id: number, updateNewsDto: UpdateNewsDto): Promise<News | null> {
    return await this.newsRepository.updateOne({ id }, updateNewsDto);
  }

  async delete(id: number): Promise<News | null> {
    return await this.newsRepository.deleteOne({ id });
  }
}
