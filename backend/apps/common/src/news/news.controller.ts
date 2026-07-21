import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Role, RolesGuard } from '@app/auth';
import { CreateNewsDto } from './dtos/create-news.dto';
import { UpdateNewsDto } from './dtos/update-news.dto';
import { NewsService } from './news.service';

@Controller('news')
@ApiTags('news')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @ApiOperation({ summary: 'Get all news' })
  @Get()
  async getAll(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    return await this.newsService.getAll(
      Number(page) || 1,
      Number(perPage) || 10,
    );
  }

  @ApiOperation({ summary: 'Get news by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.newsService.getById(Number(id));
  }

  @ApiOperation({ summary: 'Create news' })
  @Post()
  @Role('ADMINISTRATOR', 'MANAGER')
  async create(
    @Body() createNewsDto: CreateNewsDto,
    @Req() request: { user: { sub: string } },
  ) {
    return await this.newsService.create(createNewsDto, request.user.sub);
  }

  @ApiOperation({ summary: 'Update news' })
  @Put(':id')
  @Role('ADMINISTRATOR', 'MANAGER')
  async update(@Param('id') id: string, @Body() updateNewsDto: UpdateNewsDto) {
    return await this.newsService.update(Number(id), updateNewsDto);
  }

  @ApiOperation({ summary: 'Delete news' })
  @Delete(':id')
  @Role('ADMINISTRATOR', 'MANAGER')
  async delete(@Param('id') id: string) {
    return await this.newsService.delete(Number(id));
  }
}
