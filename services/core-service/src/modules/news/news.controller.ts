import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CreateNewsDto } from './dtos/create-news.dto';
import { UpdateNewsDto } from './dtos/update-news.dto';
import { NewsService } from './services/news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) { }

  @ApiProperty({ description: 'Get all news' })
  @Get()
  async getAll() {
    return await this.newsService.getAll();
  }

  @ApiProperty({ description: 'Get news by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.newsService.getById(Number(id));
  }

  @ApiProperty({ description: 'Create news' })
  @Post('create')
  async create(@Body() createNewsDto: CreateNewsDto) {
    return await this.newsService.create(createNewsDto);
  }

  @ApiProperty({ description: 'Update news' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateNewsDto: UpdateNewsDto) {
    return await this.newsService.update(Number(id), updateNewsDto);
  }

  @ApiProperty({ description: 'Delete news' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.newsService.delete(Number(id));
  }
}
