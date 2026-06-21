import { BaseUser } from "@/types/user"
import { create } from "zustand"

interface AuthStore {
  user: BaseUser | null
  setUser: (user: BaseUser | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))