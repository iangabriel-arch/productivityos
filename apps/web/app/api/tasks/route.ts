import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tasks
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Sync user to DB
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: `${userId}@clerk.dev`,
    },
  });

  const tasks = await prisma.task.findMany({
    where: { userId, parentId: null },
    include: { project: true, subtasks: true },
    orderBy: [{ createdAt: 'desc' }],
  });

  return NextResponse.json(tasks);
}

// POST /api/tasks
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, priority, dueDate, projectId } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  // Sync user to DB
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: `${userId}@clerk.dev`,
    },
  });

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      priority: priority ?? 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      projectId: projectId ?? undefined,
      userId,
    },
    include: { project: true },
  });

  return NextResponse.json(task, { status: 201 });
}