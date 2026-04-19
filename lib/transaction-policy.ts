/** Category used when a participant pays their split share (creator’s income). */
export const SPLIT_PAYMENT_INCOME_CATEGORY = 'Split Payment' as const

export function isSplitPaymentIncome(txn: {
  type: string
  linkedTxnId?: string | null
  category?: string | null
}) {
  if (txn.type !== 'INC') return false
  if (txn.linkedTxnId != null && txn.linkedTxnId !== '') return true
  if (txn.category === SPLIT_PAYMENT_INCOME_CATEGORY) return true
  return false
}
