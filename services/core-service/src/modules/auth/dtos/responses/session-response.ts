import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SessionResponse {
  @Expose()
  @ApiProperty({ type: String, description: 'Session UUID' })
  sessionId!: string;

  @Expose()
  @ApiProperty({ type: String, description: 'IP address of the device' })
  ipAddress!: string;

  @Expose()
  @ApiProperty({ type: String, description: 'Raw User-Agent header' })
  userAgent!: string;

  @Expose()
  @ApiProperty({ type: String, description: 'Parsed device name (e.g. Mac, iPhone, Windows PC)' })
  deviceName!: string;

  @Expose()
  @ApiProperty({ enum: ['desktop', 'mobile', 'tablet'], description: 'Category of the device' })
  deviceKind!: 'desktop' | 'mobile' | 'tablet';

  @Expose()
  @ApiProperty({ type: String, format: 'date-time', description: 'When the session was created' })
  createdAt!: string;

  @Expose()
  @ApiProperty({ type: String, format: 'date-time', description: 'Last activity timestamp' })
  lastActive!: string;
}
