import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { isSplitPaymentIncome } from '@/lib/transaction-policy'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('session')?.value
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const txn = await prisma.transaction.findUnique({ where: { id } })
  if (!txn) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (txn.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (isSplitPaymentIncome(txn)) {
    return NextResponse.json({ error: 'Income from split payments cannot be edited' }, { status: 403 })
  }

  const body = await req.json()
  const { amount, category, description, date } = body

  let nextAmount: number | undefined
  if (amount !== undefined) {
    nextAmount = parseFloat(String(amount))
    if (Number.isNaN(nextAmount)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      ...(nextAmount !== undefined && { amount: nextAmount }),
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description }),
      ...(date !== undefined && date !== '' && { date: new Date(date) }),
    },
    include: { split: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('session')?.value
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const txn = await prisma.transaction.findUnique({ where: { id } })
  if (!txn) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (txn.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (isSplitPaymentIncome(txn)) {
    return NextResponse.json({ error: 'Income from split payments cannot be deleted' }, { status: 403 })
  }

  await prisma.$transaction([
    prisma.transaction.updateMany({
      where: { linkedTxnId: id },
      data: { linkedTxnId: null },
    }),
    prisma.transaction.delete({ where: { id } }),
  ])

  return NextResponse.json({ success: true })
}
