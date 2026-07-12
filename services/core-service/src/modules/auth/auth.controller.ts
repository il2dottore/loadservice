import { Body, Controller, Get, HttpCode, Param, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { LoginDto } from './dtos/requests/login.dto';
import { AuthService } from './services/auth.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from '@modules/user/dtos/requests/create-user.dto';
import { UpdateUserDto } from '@modules/user/dtos/requests/update-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenDto } from './dtos/requests/refresh-token.dto';
import { SessionResponse } from './dtos/responses/session-response';
import { ResourceOwnerGuard } from '../../common/guards/resource-owner.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({
    summary: 'Auth endpoint, login using username and password',
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() request: any) {
    const ipAddress = request.headers['x-forwarded-for']?.split(',')[0]?.trim() || request.ip || '';
    const userAgent = request.headers['user-agent'] || '';
    try {
      return await this.authService.login(loginDto, { ipAddress, userAgent });
    } catch (error: any) {
      throw new UnauthorizedException(error.message);
    }
  }

  @ApiOperation({
    summary: 'Register a new user account',
  })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @ApiOperation({ summary: 'Issue a new access token for an active session' })
  @Post('refresh')
  async refresh(@Body() { refreshToken }: RefreshTokenDto) {
    return this.authService.refresh(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  async profile(@Req() request: { user: { sub: string } }) {
    return this.authService.getProfile(request.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('me')
  async updateProfile(
    @Req() request: { user: { sub: string } },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authService.updateProfile(request.user.sub, updateUserDto);
  }

  @ApiOperation({
    summary: 'Logout current session',
  })
  @HttpCode(200)
  @Post('logout')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @ApiBearerAuth()
  async logout(@Body() body: { userId: string; sessionId: string }) {
    await this.authService.logout(body.userId, body.sessionId);
    return { success: true };
  }

  @ApiOperation({
    summary: 'List active sessions for a user',
  })
  @ApiOkResponse({ type: SessionResponse, isArray: true })
  @Get('sessions/:userId')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @ApiBearerAuth()
  async listSessions(@Param('userId') userId: string) {
    return await this.authService.listSessions(userId);
  }

  @ApiOperation({
    summary: 'Logout all active sessions for a user',
  })
  @HttpCode(200)
  @Post('logout-all')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @ApiBearerAuth()
  async logoutAll(
    @Body() body: { userId: string },
    @Req() request: { user: { sub: string; sessionId: string } },
  ) {
    await this.authService.logoutAll(body.userId, request.user.sessionId);
    return { success: true };
  }
}
