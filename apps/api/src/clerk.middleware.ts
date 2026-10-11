import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, getAuth } from '@clerk/express';
import { UsersService } from './users/users.service';

@Injectable()
export class ClerkMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  use(req: Request, res: Response, next: NextFunction) {
    clerkMiddleware()(req, res, async (err?: any) => {
      if (err) return next(err);

      const auth = getAuth(req);

      if (!auth?.userId) {
        return res.status(401).json({ message: 'Not authenticated', statusCode: 401 });
      }

      try {
        const { userId, sessionClaims } = auth;
        const claims = sessionClaims as any;
        await this.usersService.syncUser(userId, {
          email: claims?.email ?? `${userId}@clerk.dev`,
          name: claims?.name ?? claims?.fullName ?? undefined,
          avatarUrl: claims?.image_url ?? undefined,
        });
        (req as any).userId = userId;
        next();
      } catch (e) {
        next(e);
      }
    });
  }
}