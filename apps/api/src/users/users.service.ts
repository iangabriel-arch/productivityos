import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async syncUser(clerkUserId: string, data: { email: string; name?: string; avatarUrl?: string }) {
    return this.prisma.user.upsert({
      where: { id: clerkUserId },
      update: {
        name: data.name,
        avatarUrl: data.avatarUrl,
      },
      create: {
        id: clerkUserId,
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}