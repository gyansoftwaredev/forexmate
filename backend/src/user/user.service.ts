import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        mobile: true,
        roleRef: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profiles: {
          include: {
            addresses: true,
            banks: true,
          }
        }
      }
    });
  }

  async updateProfile(userId: string, data: any) {
    // Update User (fullName, mobile)
    if (data.fullName || data.phone) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.fullName ? { fullName: data.fullName } : {}),
          ...(data.phone ? { mobile: data.phone } : {}),
        }
      });
    }

    // Update CustomerProfile (panNumber)
    if (data.panNumber && data.panNumber.trim()) {
      const normalizedPan = data.panNumber.trim().toUpperCase();
      
      // Validate PAN format (5 letters, 4 digits, 1 letter)
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(normalizedPan)) {
        throw new BadRequestException('Invalid PAN format. PAN must be 10 characters (e.g., ABCDE1234F).');
      }

      // Check for duplicate PAN on other accounts
      const existingPan = await this.prisma.customerProfile.findFirst({
        where: {
          panNumber: normalizedPan,
          userId: { not: userId }
        }
      });

      if (existingPan) {
        throw new ConflictException('This PAN number is already associated with another customer account.');
      }

      let profile = await this.prisma.customerProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        profile = await this.prisma.customerProfile.create({
          data: { userId },
        });
      }

      try {
        await this.prisma.customerProfile.update({
          where: { id: profile.id },
          data: { panNumber: normalizedPan }
        });
      } catch (err: any) {
        if (err.code === 'P2002') {
          throw new ConflictException('This PAN number is already associated with another customer account.');
        }
        throw err;
      }
    }

    return this.getUserProfile(userId);
  }

  async addBank(userId: string, data: any) {
    let profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await this.prisma.customerProfile.create({
        data: { userId },
      });
    }

    return this.prisma.customerBank.create({
      data: {
        bankName: data.bankName || '',
        holderName: data.holderName || '',
        accountNumber: data.accountNumber || '',
        ifscCode: data.ifscCode || '',
        bankAddress: data.bankAddress,
        profileId: profile.id,
      },
    });
  }

  async addAddress(userId: string, data: any) {
    let profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await this.prisma.customerProfile.create({
        data: { userId },
      });
    }

    return this.prisma.customerAddress.create({
      data: {
        pin: data.pin || '',
        city: data.city || '',
        state: data.state || '',
        address: data.address || '',
        landmark: data.landmark,
        addressType: data.addressType || 'RESIDENTIAL',
        profileId: profile.id,
      },
    });
  }

  async updateAddress(addressId: string, data: any) {
    return this.prisma.customerAddress.update({
      where: { id: addressId },
      data: {
        pin: data.pin,
        city: data.city,
        state: data.state,
        address: data.address,
        landmark: data.landmark,
        addressType: data.addressType,
      },
    });
  }

  async deleteAddress(addressId: string) {
    return this.prisma.customerAddress.delete({ where: { id: addressId } });
  }

  async deleteBank(bankId: string) {
    return this.prisma.customerBank.delete({ where: { id: bankId } });
  }

  async addKycDocument(userId: string, data: any) {
    return this.prisma.kycDocument.create({
      data: {
        docType: data.lockStatus || 'PASSPORT',
        filePath: data.imageOne || '',
        userId,
      },
    });
  }
}
