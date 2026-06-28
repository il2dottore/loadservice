import { Body, Controller, Get, HttpCode, Param, Post, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { AuthService } from './services/auth.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from '@modules/user/dtos/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({
    summary: 'Auth endpoint, login using username and password',
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
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

  @ApiOperation({
    summary: 'Logout current session',
  })
  @HttpCode(200)
  @Post('logout')
  async logout(@Body() body: { userId: string; sessionId: string }) {
    await this.authService.logout(body.userId, body.sessionId);
    return { success: true };
  }

  @ApiOperation({
    summary: 'List active sessions for a user',
  })
  @Get('sessions/:userId')
  async listSessions(@Param('userId') userId: string) {
    return await this.authService.listSessions(userId);
  }

  @ApiOperation({
    summary: 'Logout all active sessions for a user',
  })
  @HttpCode(200)
  @Post('logout-all')
  async logoutAll(@Body() body: { userId: string }) {
    await this.authService.logoutAll(body.userId);
    return { success: true };
  }
}
