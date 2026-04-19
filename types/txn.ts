export enum TxnType {
    EXP = 'EXP',
    INC = 'INC',
}

export type Transaction = {
  id: string
  amount: number
  type: TxnType
  category: string | null
  description: string | null
  date: Date
  userId: string
  splitId: string | null
  linkedTxnId: string | null
}