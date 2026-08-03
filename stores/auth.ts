"use client"

import { InvariantError } from "@/lib/error/errors"
import type { UserDetails } from "@/types/user"
import { createContext, useContext } from "react"
import { createStore, useStore } from "zustand"

interface AuthStoreState {
  user: UserDetails | null
}

interface AuthStoreActions {
  setUser: (user: UserDetails | null) => void
}

interface AuthStore extends AuthStoreState, AuthStoreActions {}

export function createAuthStore(initState: AuthStoreState) {
  return createStore<AuthStore>((set) => ({
    ...initState,
    setUser: (user) => set({ user }),
  }))
}

type AuthStoreApi = ReturnType<typeof createAuthStore>

export const AuthStoreContext = createContext<AuthStoreApi | null>(null)

export function useAuthStore<T>(selector: (store: AuthStore) => T): T {
  const store = useContext(AuthStoreContext)
  if (!store) {
    throw new InvariantError("useAuthStore must be used within AuthProvider")
  }
  return useStore(store, selector)
}
