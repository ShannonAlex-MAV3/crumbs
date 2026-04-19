import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('session')?.value
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const data = await req.json()
    const { amount, description, participants, myShare } = data // participants: Array<{ name: string, amountOwed: number }>

    // Build participant list — optionally prepend creator's own share
    const allParticipants = [
      ...(myShare != null && !isNaN(parseFloat(myShare))
        ? [{
            name: 'Me',
            amountOwed: parseFloat(myShare),
            hasPaid: true,
            userId: userId,
          }]
        : []),
      ...participants.map((p: any) => ({
        name: p.name,
        amountOwed: parseFloat(p.amountOwed),
        note: p.note || null,
      })),
    ]

    // 1. Create Split
    const split = await prisma.split.create({
      data: {
        totalAmount: parseFloat(amount),
        description,
        creatorId: userId,
        participants: {
          create: allParticipants,
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

export async function DELETE(req: Request) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('session')?.value
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const split = await prisma.split.findFirst({
    where: { id, creatorId: userId },
  })
  if (!split) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.$transaction(async (tx) => {
    const splitTxnIds = (
      await tx.transaction.findMany({
        where: { splitId: id },
        select: { id: true },
      })
    ).map((t) => t.id)

    if (splitTxnIds.length > 0) {
      await tx.transaction.updateMany({
        where: { linkedTxnId: { in: splitTxnIds } },
        data: { linkedTxnId: null },
      })
    }

    await tx.transaction.deleteMany({ where: { splitId: id } })
    await tx.split.delete({ where: { id } })
  })

  return NextResponse.json({ success: true })
}
