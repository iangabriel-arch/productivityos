import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/goals
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const goals = await prisma.goal.findMany({
    where: { userId },
    include: {
      tasks: {
        select: { id: true, status: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(goals);
}

// POST /api/goals
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, description, dueDate } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email: `${userId}@clerk.dev` },
  });

  const goal = await prisma.goal.create({
    data: {
      title: title.trim(),
      description: description?.trim() ?? undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      userId,
    },
  });

  return NextResponse.json(goal, { status: 201 });
}