import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateNewsDto {
  @IsString()
  @IsOptional()
  title!: string;

  @IsString()
  @IsOptional()
  content!: string;

  @IsUUID()
  @IsOptional()
  authorId?: string;
}
