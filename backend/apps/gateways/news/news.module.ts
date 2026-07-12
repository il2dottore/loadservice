import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '../../../libs/database/src/postgresql/postgresql.module';
import { NewsController } from './news.controller';
import { NewsRepository } from './news.repository';
import { NewsService } from './services/news.service';

@Module({
  imports: [PostgresDatabaseModule],
  controllers: [NewsController],
  providers: [NewsService, NewsRepository],
  exports: [NewsService]
})
export class NewsModule { }
