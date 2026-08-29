import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
  Req,
  Res,
  Ip,
  Headers,
  UnauthorizedException,
  Delete,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { 
  LoginDto, 
  RegisterDto, 
  GoogleLoginDto, 
  SendOtpDto, 
  VerifyOtpDto, 
  RequestResetDto, 
  ResetPasswordDto 
} from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  private setRefreshCookie(res: any, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: false, // Set to true in prod (requires HTTPS). For local dev we use false
      sameSite: 'lax',
      path: '/',
      maxAge: 365 * 24 * 60 * 60 * 1000, // 365 days
    });
  }

  private clearRefreshCookie(res: any) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login client/user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or account locked' })
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.login(dto, ip, userAgent, dto.deviceId);
    this.setRefreshCookie(res, result.refresh_token);
    return {
      access_token: result.access_token,
      user: result.user,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('staff-login')
  @ApiOperation({ summary: 'Login staff member' })
  @ApiResponse({ status: 200, description: 'Staff login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized staff access' })
  async staffLogin(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.login(dto, ip, userAgent, dto.deviceId);
    const staffRoles = [
      'SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN', 'COMPLIANCE_ADMIN', 
      'STAFF', 'BRANCH_OPERATIONS', 'COMPLIANCE', 'DEALER', 'ACCOUNTANT',
      'AGENT', 'TELLER', 'BRANCH_KYC_STAFF', 'BRANCH_INVENTORY_STAFF',
      'BRANCH_FULFILLMENT_STAFF', 'BRANCH_CASHIER', 'BRANCH_MANAGER'
    ];
    
    if (!staffRoles.includes(result.user.role)) {
      throw new UnauthorizedException('You do not have staff permissions.');
    }
    this.setRefreshCookie(res, result.refresh_token);

    // For BRANCH_MANAGER: also generate a workforce JWT from their linked Employee record
    let workforce_token: string | null = null;
    if (result.user.role === 'BRANCH_MANAGER') {
      // Find linked Employee record by email match or branchStaff association
      const employee = await this.prisma.employee.findFirst({
        where: {
          OR: [
            { email: dto.email?.toLowerCase() },
            { role: 'BRANCH_MANAGER' as any, status: 'ACTIVE' },
          ],
        },
        include: { branch: true },
      });
      if (employee) {
        workforce_token = this.jwtService.sign(
          {
            sub: employee.id,
            employeeCode: employee.employeeCode,
            role: employee.role,
            branchId: employee.branchId,
            type: 'WORKFORCE',
          },
          { expiresIn: '12h' },
        );
      }
    }

    return {
      access_token: result.access_token,
      user: result.user,
      ...(workforce_token ? { workforce_token } : {}),
    };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @ApiOperation({ summary: 'Register a new customer' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(
    @Body() dto: RegisterDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.register(dto, ip, userAgent);
  }

  @HttpCode(HttpStatus.OK)
  @Post('google')
  @ApiOperation({ summary: 'Login with Google OAuth' })
  async googleLogin(
    @Body() dto: GoogleLoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.googleLogin(dto.credential, ip, userAgent);
    this.setRefreshCookie(res, result.refresh_token);
    return {
      access_token: result.access_token,
      user: result.user,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate and refresh JWT access token using HttpOnly cookie' })
  @ApiResponse({ status: 200, description: 'Tokens rotated successfully' })
  @ApiResponse({ status: 401, description: 'Session expired/revoked' })
  async refresh(
    @Req() req: any,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: any,
  ) {
    const token = req.cookies?.['refresh_token'];
    if (!token) {
      throw new UnauthorizedException('No refresh token provided.');
    }
    const result = await this.authService.refresh(token, ip, userAgent);
    this.setRefreshCookie(res, result.refresh_token);
    return {
      access_token: result.access_token,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @ApiOperation({ summary: 'Revoke and log out current session' })
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const token = req.cookies?.['refresh_token'];
    if (token) {
      await this.authService.logout(token);
    }
    this.clearRefreshCookie(res);
    return { message: 'Logged out successfully.' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Request() req: any) {
    return req.user;
  }

  // ─── OTP FLOWS ─────────────────────────────────────────────────────────────
  @HttpCode(HttpStatus.OK)
  @Post('otp/send')
  @ApiOperation({ summary: 'Queue a 6-digit verification OTP' })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.recipient, dto.purpose);
  }

  @HttpCode(HttpStatus.OK)
  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify a sent OTP code' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const verified = await this.authService.verifyOtp(dto.recipient, dto.purpose, dto.code);
    return { verified };
  }

  // ─── PASSWORD RESET FLOWS ──────────────────────────────────────────────────
  @HttpCode(HttpStatus.OK)
  @Post('password-reset/request')
  @ApiOperation({ summary: 'Request password reset token link' })
  async requestReset(@Body() dto: RequestResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('password-reset/reset')
  @ApiOperation({ summary: 'Reset password using high-entropy token link' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  // ─── SESSION LISTS & REVOCATION ────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List user active sessions' })
  async getSessions(@Request() req: any) {
    return this.authService.getSessions(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke specific active session' })
  async revokeSession(@Request() req: any, @Param('id') sessionId: string) {
    return this.authService.revokeSession(req.user.id, sessionId);
  }
}
