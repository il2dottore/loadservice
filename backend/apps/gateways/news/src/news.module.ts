import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsRepository } from './news.repository';
import { NewsService } from './services/news.service';
import { PostgresDatabaseModule } from '@app/database/postgresql/postgresql.module';

@Module({
  imports: [
    PostgresDatabaseModule.forService()
  ],
  controllers: [NewsController],
  providers: [NewsService, NewsRepository],
  exports: [NewsService]
})
export class NewsModule { }
