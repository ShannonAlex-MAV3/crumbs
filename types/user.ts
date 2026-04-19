import { Status } from "./common"
import { Split } from "./split"
import { Transaction } from "./txn"

export type User = {
  id: string
  email: string | null
  name: string
  picture: string | null
  provider: string | null
  providerId: string | null
  status: Status

  transactions: Transaction[]
  splitsCreated: Split[]
  splitsOwed: Participant[]
}

export type Participant = {
  id: string
  name: string
  amountOwed: number
  hasPaid: boolean
  note: string | null
  secureToken: string
  splitId: string
  userId: string | null
}