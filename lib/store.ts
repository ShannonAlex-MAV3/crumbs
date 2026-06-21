import { create } from 'zustand'

export interface User {
  id: string
  email: string
  name: string | null
  picture: string | null
}

interface AppState {
  user: User | null
  setUser: (user: User | null) => void
  isAuthModalOpen: boolean
  setAuthModalOpen: (isOpen: boolean) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isAuthModalOpen: false,
  setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),
}))
