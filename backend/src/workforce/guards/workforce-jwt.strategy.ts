import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkforceJwtStrategy extends PassportStrategy(Strategy, 'workforce-jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'forexmate-secret',
    });
  }

  async validate(payload: any) {
    let employee = null;

    if (payload.type === 'WORKFORCE') {
      employee = await this.prisma.employee.findUnique({
        where: { id: payload.sub },
        include: { branch: true },
      });
    } else {
      // Standard JWT payload (sub is User ID)
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      const email = user?.email || payload.email;

      if (email) {
        employee = await this.prisma.employee.findFirst({
          where: { email: email.toLowerCase() },
          include: { branch: true },
        });
      }

      // Fallback: search for active branch manager employee
      if (!employee) {
        employee = await this.prisma.employee.findFirst({
          where: {
            role: 'BRANCH_MANAGER' as any,
            status: 'ACTIVE',
          },
          include: { branch: true },
        });
      }
    }

    if (!employee || employee.status !== 'ACTIVE') {
      throw new UnauthorizedException('Employee account not found or deactivated.');
    }

    return {
      id: employee.id,
      employeeCode: employee.employeeCode,
      name: employee.name,
      role: employee.role,
      branchId: employee.branchId,
      branchName: employee.branch?.branchName || '',
    };
  }
}
