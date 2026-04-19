import { Transaction } from "./txn"
import { Participant } from "./user"

export type Split = {
  id: string
  totalAmount: number
  description: string | null
  date: Date
  creatorId: string
  participants: Participant[]
  transactions: Transaction[]
}   