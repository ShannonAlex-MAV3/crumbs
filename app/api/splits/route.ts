import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('session')?.value
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const data = await req.json()
    const { amount, description, participants } = data // participants: Array<{ name: string, amountOwed: number }>

    // 1. Create Split
    const split = await prisma.split.create({
      data: {
        totalAmount: parseFloat(amount),
        description,
        creatorId: userId,
        participants: {
          create: participants.map((p: any) => ({
            name: p.name,
            amountOwed: parseFloat(p.amountOwed),
          })),
        },
      },
      include: {
        participants: true,
      },
    })

    // 2. Create the Transaction representing the Total Expense for the creator
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type: 'EXP',
        category: 'Split Outing',
        description: description,
        userId: userId,
        splitId: split.id,
      },
    })

    return NextResponse.json({ split, transaction })
  } catch (error) {
    console.error('Split creation error:', error)
    return NextResponse.json({ error: 'Failed to create split' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('session')?.value
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const splits = await prisma.split.findMany({
    where: { creatorId: userId },
    include: { participants: true, transactions: true },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(splits)
}
