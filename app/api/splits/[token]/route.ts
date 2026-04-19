import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { SPLIT_PAYMENT_INCOME_CATEGORY } from '@/lib/transaction-policy'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const resolvedParams = await params
  const { token } = resolvedParams
  const participant = await prisma.participant.findUnique({
    where: { secureToken: token },
    include: {
      split: {
        include: {
          creator: {
            select: { name: true, email: true },
          },
          participants: {
            select: { id: true, name: true, amountOwed: true, hasPaid: true, note: true, secureToken: true },
          },
        },
      },
    },
  })

  if (!participant) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(participant)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const cookieStore = await cookies()
  const payerId = cookieStore.get('session')?.value
  if (!payerId) {
    return NextResponse.json({ error: 'Sign in to complete this payment', code: 'SIGN_IN_REQUIRED' }, { status: 401 })
  }

  const resolvedParams = await params
  const { token } = resolvedParams

  const participant = await prisma.participant.findUnique({
    where: { secureToken: token },
    include: {
      split: {
        include: {
          creator: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (!participant) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (participant.hasPaid) {
    return NextResponse.json({ error: 'Already paid' }, { status: 400 })
  }

  if (participant.userId && participant.userId !== payerId) {
    return NextResponse.json({ error: 'This link is associated with another account' }, { status: 403 })
  }

  if (payerId === participant.split.creatorId) {
    return NextResponse.json(
      { error: 'Use your dashboard to manage this split; this link is for participants.' },
      { status: 403 }
    )
  }

  const payer = await prisma.user.findUnique({
    where: { id: payerId },
    select: { name: true, email: true },
  })
  if (!payer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const creatorLabel = participant.split.creator.name || 'split host'
  const splitTitle = participant.split.description || 'split'

  const result = await prisma.$transaction(async (tx) => {
    const updatedParticipant = await tx.participant.update({
      where: { id: participant.id },
      data: {
        hasPaid: true,
        userId: participant.userId ?? payerId,
      },
    })

    const expenseTxn = await tx.transaction.create({
      data: {
        amount: participant.amountOwed,
        type: 'EXP',
        category: 'Split settlement',
        description: `Paid ${creatorLabel} — your share of "${splitTitle}"`,
        userId: payerId,
        splitId: participant.splitId,
      },
    })

    const payerDisplay = payer.name || payer.email || participant.name || 'Friend'

    const incomeTxn = await tx.transaction.create({
      data: {
        amount: participant.amountOwed,
        type: 'INC',
        category: SPLIT_PAYMENT_INCOME_CATEGORY,
        description: `Payment from ${payerDisplay} for ${splitTitle}`,
        userId: participant.split.creatorId,
        splitId: participant.splitId,
        linkedTxnId: expenseTxn.id,
      },
    })

    return { updatedParticipant, expenseTxn, incomeTxn }
  })

  return NextResponse.json(result)
}

// PATCH: edit a participant's name, amountOwed, and note (only if not paid)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('session')?.value
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const resolvedParams = await params
  const { token } = resolvedParams

  const participant = await prisma.participant.findUnique({
    where: { secureToken: token },
    include: { split: true },
  })

  if (!participant) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (participant.hasPaid) return NextResponse.json({ error: 'Cannot edit a paid participant' }, { status: 403 })
  if (participant.split.creatorId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { name, amountOwed, note } = body

  const updated = await prisma.participant.update({
    where: { id: participant.id },
    data: {
      ...(name !== undefined && { name }),
      ...(amountOwed !== undefined && { amountOwed: parseFloat(amountOwed) }),
      ...(note !== undefined && { note }),
    },
  })

  return NextResponse.json(updated)
}
