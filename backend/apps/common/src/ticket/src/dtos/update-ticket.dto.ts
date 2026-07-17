import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTicketDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(10000)
  content!: string;
}
