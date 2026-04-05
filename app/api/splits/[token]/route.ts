import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
  const resolvedParams = await params
  const { token } = resolvedParams
  
  const participant = await prisma.participant.findUnique({
    where: { secureToken: token },
    include: { split: true },
  })

  if (!participant) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (participant.hasPaid) {
    return NextResponse.json({ error: 'Already paid' }, { status: 400 })
  }

  // Mark as paid
  const updatedParticipant = await prisma.participant.update({
    where: { id: participant.id },
    data: { hasPaid: true },
  })

  // Create linked income for the creator
  const incomeTxn = await prisma.transaction.create({
    data: {
      amount: participant.amountOwed,
      type: 'INC',
      category: 'Split Payment',
      description: `Payment from ${participant.name || 'Friend'} for ${participant.split.description || 'Split'}`,
      userId: participant.split.creatorId,
      splitId: participant.splitId,
    },
  })

  return NextResponse.json({ participant: updatedParticipant, transaction: incomeTxn })
}
