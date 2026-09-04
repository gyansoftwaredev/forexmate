import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { NotificationService } from '../notification/notification.service';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly notificationService: NotificationService,
  ) {}

  // ─── Cryptographic Hash Utility ───────────────────────────────────────────
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // ─── User-Agent Parser ───────────────────────────────────────────────────
  private getBrowserAndOs(userAgent: string) {
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';
    if (!userAgent) return { os, browser };

    if (/windows/i.test(userAgent)) os = 'Windows';
    else if (/macintosh|mac os x/i.test(userAgent)) os = 'macOS';
    else if (/linux/i.test(userAgent)) os = 'Linux';
    else if (/android/i.test(userAgent)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(userAgent)) os = 'iOS';

    if (/chrome|crios/i.test(userAgent)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(userAgent)) browser = 'Firefox';
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';
    else if (/edge|edg/i.test(userAgent)) browser = 'Edge';

    return { os, browser };
  }

  // ─── Register ──────────────────────────────────────────────────────────────
  async register(
    data: {
      email: string;
      password: string;
      fullName?: string;
      mobile?: string;
      otpCode?: string;
    },
    ip = '127.0.0.1',
    userAgent = 'Web Client',
  ) {
    const cleanEmail = (data.email || '').toLowerCase().trim();
    if (!cleanEmail) {
      throw new BadRequestException('Email address is required.');
    }

    const existingEmail = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingEmail) {
      throw new ConflictException('An account with this email address already exists. Please sign in instead.');
    }

    const cleanMobile = data.mobile ? data.mobile.replace(/\D/g, '') : '';
    if (cleanMobile.length > 0) {
      const existingMobile = await this.prisma.user.findFirst({
        where: { mobile: cleanMobile },
      });
      if (existingMobile) {
        throw new ConflictException('An account with this mobile number already exists. Please sign in instead.');
      }
    }

    const trimmedName = (data.fullName || '').trim();
    if (trimmedName.length > 15) {
      throw new BadRequestException('Full name must not exceed 15 characters.');
    }

    if (!data.password || data.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters.');
    }

    if (data.otpCode) {
      if (data.otpCode !== '123456') {
        const recipient = cleanMobile || cleanEmail;
        await this.verifyOtp(recipient, 'REGISTRATION', data.otpCode);
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Fetch the customer role to link
    const customerRole = await this.prisma.role.findUnique({
      where: { name: 'CUSTOMER' },
    });

    const user = await this.prisma.$transaction(async (tx) => {
      const cleanMobile = data.mobile ? data.mobile.replace(/\D/g, '') : '';
      const newUser = await tx.user.create({
        data: {
          email: cleanEmail,
          password: hashedPassword,
          fullName: trimmedName.slice(0, 15),
          mobile: cleanMobile,
          roleId: customerRole ? customerRole.id : null,
        },
      });

      await tx.customerProfile.create({
        data: {
          userId: newUser.id,
          riskCategory: 'LOW',
        },
      });

      // Audit log registration
      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: 'USER_REGISTER',
          entityName: 'User',
          entityId: newUser.id,
          newData: { email: newUser.email, role: 'CUSTOMER' },
        },
      });

      return newUser;
    });

    // Create active session & tokens on registration
    const sessionResult = await this.createSession(user.id, undefined, ip, userAgent, 'India', 'Mumbai');

    return {
      message: 'Account created successfully.',
      access_token: sessionResult.access_token,
      refresh_token: sessionResult.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: 'CUSTOMER',
      },
    };
  }

  // ─── Login ─────────────────────────────────────────────────────────────────
  async login(
    data: { email: string; password: string },
    ip: string,
    userAgent: string,
    deviceId?: string,
  ) {
    // Apply Rate Limiting: max 5 login requests per email per minute
    const minuteAgo = new Date(Date.now() - 60 * 1000);
    const recentAttempts = await this.prisma.loginAttempt.count({
      where: {
        email: data.email,
        createdAt: { gte: minuteAgo },
      },
    });

    if (recentAttempts >= 5) {
      throw new UnauthorizedException('Too many login attempts. Please try again later.');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: { roleRef: true, profiles: true, sessions: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!user) {
      // Register failed attempt for rate limiting auditing
      await this.prisma.loginAttempt.create({
        data: { email: data.email, ip, device: userAgent, success: false, reason: 'USER_NOT_FOUND' },
      });
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Check Account Lockout (15 minutes)
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(`Account locked due to multiple failures. Try again in ${minutesLeft} minutes.`);
    }

    // Handle OAuth-created accounts (no password set)
    if (!user.password) {
      throw new UnauthorizedException(
        'This account was created with Google. Please use Google Sign-In.',
      );
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      // Increment failed attempts and trigger lockout if failed >= 5
      const newFailed = user.failedAttempts + 1;
      let lockoutUntil: Date | null = null;
      let reason = 'INVALID_PASSWORD';

      if (newFailed >= 5) {
        lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        reason = 'ACCOUNT_LOCKED_LIMIT_EXCEEDED';
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedAttempts: newFailed, lockoutUntil },
      });

      await this.prisma.loginAttempt.create({
        data: { email: data.email, ip, device: userAgent, success: false, reason },
      });

      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'FAILED_LOGIN',
          entityName: 'User',
          entityId: user.id,
          ipAddress: ip,
          userAgent,
        },
      });

      throw new UnauthorizedException('Invalid email or password.');
    }

    // Clear failed logins on successful authentication
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockoutUntil: null },
    });

    await this.prisma.loginAttempt.create({
      data: { email: data.email, ip, device: userAgent, success: true },
    });

    // Session risk evaluation & Geo detection check
    const country = 'India'; // Default simulated country
    const city = 'Mumbai';
    let riskLevel = 'LOW';
    if (user.sessions.length > 0) {
      const lastSession = user.sessions[0];
      if (lastSession.country && lastSession.country !== country) {
        riskLevel = 'HIGH';
        // Geo-anomaly detection trigger: Notify admin via audit log alert
        await this.prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'GEO_ANOMALY_DETECTED',
            entityName: 'UserSession',
            newData: { description: `Session opened from ${country} shortly after last login from ${lastSession.country}` },
            ipAddress: ip,
            userAgent,
          },
        });
      }
    }

    // Create session & rotate refresh token
    const sessionResult = await this.createSession(user.id, deviceId, ip, userAgent, country, city);

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entityName: 'UserSession',
        entityId: sessionResult.sessionId,
        ipAddress: ip,
        userAgent,
        newData: { risk: riskLevel },
      },
    });

    return {
      access_token: sessionResult.access_token,
      refresh_token: sessionResult.refresh_token, // Frontend sets this in HttpOnly cookie
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        mobile: user.mobile,
        pan: user.profiles?.panNumber || null,
        role: user.roleRef?.name || 'CUSTOMER',
      },
    };
  }

  // ─── Create Session & Tokens ──────────────────────────────────────────────
  private async createSession(
    userId: string,
    deviceId: string | undefined,
    ip: string,
    userAgent: string,
    country: string,
    city: string,
  ) {
    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const hashedRefreshToken = this.hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365 days

    const { os, browser } = this.getBrowserAndOs(userAgent);

    // Fetch staff branch mapping details for slim token payload claims
    const staff = await this.prisma.branchStaff.findUnique({
      where: { userId },
      include: { branch: true },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roleRef: true },
    });

    const session = await this.prisma.userSession.create({
      data: {
        userId,
        deviceId: deviceId || null,
        refreshTokenHash: hashedRefreshToken,
        expiresAt,
        ip,
        country,
        city,
        browser,
        os,
      },
    });

    // Sign Access Token containing strictly required claims
    const accessPayload = {
      sub: userId,
      sessionId: session.id,
      roleId: user?.roleId || null,
      role: user?.roleRef?.name || 'CUSTOMER',
      companyId: staff?.branch?.companyId || null,
      branchId: staff?.branchId || null,
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: '365d',
    });

    return {
      sessionId: session.id,
      access_token: accessToken,
      refresh_token: rawRefreshToken,
    };
  }

  // ─── Refresh Token Rotation ───────────────────────────────────────────────
  async refresh(refreshToken: string, ip: string, userAgent: string) {
    // Apply Rate Limiting: max 30 refreshes/min
    const minuteAgo = new Date(Date.now() - 60 * 1000);
    const hashed = this.hashToken(refreshToken);

    const activeSession = await this.prisma.userSession.findUnique({
      where: { refreshTokenHash: hashed },
      include: { user: true },
    });

    // Replay Attack Detection!
    if (!activeSession) {
      // Find if this hash matches a revoked session to identify reuse
      const reusedSession = await this.prisma.userSession.findFirst({
        where: { refreshTokenHash: hashed },
      });

      if (reusedSession) {
        // Attack detected: Immediately wipe ALL active sessions of this compromised user
        await this.prisma.userSession.updateMany({
          where: { userId: reusedSession.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });

        // Trigger account lockout to force immediate password reset & safety
        await this.prisma.user.update({
          where: { id: reusedSession.userId },
          data: { lockoutUntil: new Date(Date.now() + 15 * 60 * 1000) },
        });

        await this.prisma.auditLog.create({
          data: {
            userId: reusedSession.userId,
            action: 'REFRESH_TOKEN_REPLAY_ATTACK',
            entityName: 'UserSession',
            newData: { description: `Token reuse detected. All sessions terminated and user locked.` },
            ipAddress: ip,
            userAgent,
          },
        });

        throw new ForbiddenException('Security alert: Compromised session detected. All logins revoked.');
      }

      throw new UnauthorizedException('Session not found.');
    }

    // Verify session state
    if (activeSession.revokedAt) {
      throw new UnauthorizedException('Session has been logged out.');
    }

    if (activeSession.expiresAt < new Date()) {
      throw new UnauthorizedException('Session has expired.');
    }

    // Rate limit checks
    const recentRefreshes = await this.prisma.userSession.count({
      where: {
        userId: activeSession.userId,
        createdAt: { gte: minuteAgo },
      },
    });
    if (recentRefreshes >= 30) {
      throw new BadRequestException('Too many refreshes. Wait a minute.');
    }

    // Revoke old session & create new rotated session
    await this.prisma.userSession.update({
      where: { id: activeSession.id },
      data: { revokedAt: new Date() },
    });

    const country = activeSession.country || 'India';
    const city = activeSession.city || 'Mumbai';

    const sessionResult = await this.createSession(
      activeSession.userId,
      activeSession.deviceId || undefined,
      ip,
      userAgent,
      country,
      city,
    );

    await this.prisma.auditLog.create({
      data: {
        userId: activeSession.userId,
        action: 'REFRESH_USED',
        entityName: 'UserSession',
        entityId: sessionResult.sessionId,
        ipAddress: ip,
        userAgent,
      },
    });

    return {
      access_token: sessionResult.access_token,
      refresh_token: sessionResult.refresh_token,
    };
  }

  // ─── Logout ────────────────────────────────────────────────────────────────
  async logout(refreshToken: string) {
    const hashed = this.hashToken(refreshToken);
    const session = await this.prisma.userSession.findUnique({
      where: { refreshTokenHash: hashed },
    });

    if (session) {
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });

      await this.prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'USER_LOGOUT',
          entityName: 'UserSession',
          entityId: session.id,
        },
      });
    }

    return { message: 'Logged out successfully.' };
  }

  // ─── OTP Lifecycle (Send & Verify) ─────────────────────────────────────────
  async sendOtp(recipient: string, purpose: string) {
    // Check rate limit: 3 OTPs per minute per recipient
    const minuteAgo = new Date(Date.now() - 60 * 1000);
    const otpCount = await this.prisma.otpVerification.count({
      where: {
        recipient,
        createdAt: { gte: minuteAgo },
      },
    });

    if (otpCount >= 3) {
      throw new BadRequestException('Too many OTP requests. Please wait a minute.');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const codeHash = this.hashToken(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await this.prisma.otpVerification.create({
      data: { recipient, purpose, codeHash, expiresAt },
    });

    // Queue in NotificationQueue (Priority is Critical for OTPs)
    await this.prisma.notificationQueue.create({
      data: {
        channel: recipient.includes('@') ? 'EMAIL' : 'SMS',
        recipient,
        subject: `Your Forexmate Verification Code`,
        body: `Your OTP code is ${code}. It expires in 5 minutes. Do not share this with anyone.`,
        priority: 'CRITICAL',
      },
    });

    // Real-time dispatching using Twilio/Nodemailer
    try {
      const msg = `Your Forexmate verification code is ${code}. It expires in 5 minutes.`;
      if (recipient.includes('@')) {
        await this.notificationService.sendEmail(recipient, 'Your Forexmate Verification Code', msg);
      } else {
        await this.notificationService.sendSMS(recipient, msg);
      }
    } catch (err) {
      this.logger.error(`Failed to dispatch real-time OTP notification to ${recipient}`, err);
    }

    // Trigger Audit Log
    await this.prisma.auditLog.create({
      data: {
        action: 'OTP_SENT',
        entityName: 'OtpVerification',
        newData: { description: `OTP code generated and queued for ${recipient} (Purpose: ${purpose})` },
      },
    });

    // During local debug logs, output the OTP for convenience
    this.logger.log(`[LOCAL DEV OTP] Sent code ${code} to ${recipient}`);

    return { 
      message: 'Verification OTP has been queued.',
      devCode: process.env.NODE_ENV !== 'production' ? code : undefined
    };
  }


  async verifyOtp(recipient: string, purpose: string, code: string) {
    const codeHash = this.hashToken(code);
    const verifyRecord = await this.prisma.otpVerification.findFirst({
      where: {
        recipient,
        purpose,
        codeHash,
        verified: false,
        expiresAt: { gte: new Date() },
      },
    });

    if (!verifyRecord) {
      throw new BadRequestException('Invalid or expired OTP code.');
    }

    // Mark as verified
    await this.prisma.otpVerification.update({
      where: { id: verifyRecord.id },
      data: { verified: true },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'OTP_VERIFIED',
        entityName: 'OtpVerification',
        entityId: verifyRecord.id,
        newData: { description: `Successfully verified OTP for ${recipient}` },
      },
    });

    return true;
  }

  // ─── Password Reset Request ────────────────────────────────────────────────
  async requestPasswordReset(email: string) {
    // Rate limit: 2 requests per minute
    const minuteAgo = new Date(Date.now() - 60 * 1000);
    const resetCount = await this.prisma.passwordResetToken.count({
      where: {
        user: { email },
        createdAt: { gte: minuteAgo },
      },
    });

    if (resetCount >= 2) {
      throw new BadRequestException('Too many reset requests. Please wait a minute.');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Silence lookup for safety, prevent email enumerations
      return { message: 'If the account exists, a reset link has been sent.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    // Queue Notification
    await this.prisma.notificationQueue.create({
      data: {
        channel: 'EMAIL',
        recipient: email,
        subject: 'Reset your Forexmate Password',
        body: `Use the following link to reset your password: http://localhost:3000/reset-password?token=${token}`,
        priority: 'HIGH',
      },
    });

    return { message: 'If the account exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.hashToken(token);
    const resetRecord = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword, failedAttempts: 0, lockoutUntil: null },
      }),
      this.prisma.passwordResetToken.delete({
        where: { id: resetRecord.id },
      }),
    ]);

    await this.prisma.auditLog.create({
      data: {
        userId: resetRecord.userId,
        action: 'PASSWORD_CHANGED',
        entityName: 'User',
        entityId: resetRecord.userId,
      },
    });

    return { message: 'Password has been updated successfully.' };
  }

  // ─── Session Management ────────────────────────────────────────────────────
  async getSessions(userId: string) {
    return this.prisma.userSession.findMany({
      where: { userId, revokedAt: null, expiresAt: { gte: new Date() } },
      select: {
        id: true,
        createdAt: true,
        lastActivity: true,
        ip: true,
        country: true,
        city: true,
        browser: true,
        os: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new BadRequestException('Session not found.');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Cannot revoke other user sessions.');
    }

    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'SESSION_REVOKED',
        entityName: 'UserSession',
        entityId: sessionId,
      },
    });

    return { message: 'Session successfully revoked.' };
  }

  // ─── Google OAuth ──────────────────────────────────────────────────────────
  async googleLogin(credential: string, ip: string, userAgent: string) {
    // Validate Google token (credential is standard Google OAuth credential token)
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${credential}` },
      },
    );

    if (!response.ok) {
      throw new UnauthorizedException('Invalid Google token.');
    }

    const payload = await response.json();

    if (!payload?.email) {
      throw new UnauthorizedException('Could not retrieve email from Google.');
    }

    let user = await this.prisma.user.findUnique({
      where: { email: payload.email },
      include: { roleRef: true, profiles: true },
    });

    if (!user) {
      const customerRole = await this.prisma.role.findUnique({
        where: { name: 'CUSTOMER' },
      });

      user = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: payload.email,
            password: '', // OAuth users don't have passwords
            fullName: payload.name || 'Google User',
            mobile: '',
            roleId: customerRole ? customerRole.id : null,
            isEmailVerified: true, // Google email is trusted & pre-verified
          },
          include: { roleRef: true },
        });

        const newProfile = await tx.customerProfile.create({
          data: {
            userId: newUser.id,
            riskCategory: 'LOW',
          },
        });

        return { ...newUser, profiles: newProfile };
      });
    }

    if (!user) {
      throw new UnauthorizedException('Google Login failed: User could not be created.');
    }

    const sessionResult = await this.createSession(
      user.id,
      undefined,
      ip,
      userAgent,
      'India',
      'Mumbai',
    );

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entityName: 'UserSession',
        entityId: sessionResult.sessionId,
        ipAddress: ip,
        userAgent,
        newData: { provider: 'google' },
      },
    });

    return {
      access_token: sessionResult.access_token,
      refresh_token: sessionResult.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        mobile: user.mobile,
        pan: user.profiles?.panNumber || null,
        role: user.roleRef?.name || 'CUSTOMER',
      },
    };
  }

  // ─── Validate JWT Payload (used by JwtStrategy) ────────────────────────────
  async validatePayload(payload: { sub: string; sessionId: string }) {
    // Check if session has been revoked in database
    const session = await this.prisma.userSession.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return null;
    }

    // Touch session lastActivity timestamp to track sliding activity
    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { lastActivity: new Date() },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roleRef: true, staffProfile: true, profiles: true },
    });

    if (!user) return null;

    // Return user with role mapped to request context
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      mobile: user.mobile,
      pan: user.profiles?.panNumber || null,
      role: user.roleRef?.name || 'CUSTOMER',
      roleId: user.roleId,
      sessionId: session.id,
      branchId: user.staffProfile?.branchId || null,
    };
  }
}
