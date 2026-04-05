import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('session')?.value
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    include: { split: true },
  })
  return NextResponse.json(transactions)
}

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('session')?.value
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  const { amount, type, category, description, date } = data

  const transaction = await prisma.transaction.create({
    data: {
      amount: parseFloat(amount),
      type,
      category,
      description,
      date: date ? new Date(date) : new Date(),
      userId,
    },
  })

  return NextResponse.json(transaction)
}
