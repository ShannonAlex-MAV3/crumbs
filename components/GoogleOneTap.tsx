'use client'

import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

export function GoogleOneTap() {
  const setUser = useAppStore((state) => state.setUser)
  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current) return
    if (typeof window === 'undefined' || !(window as any).google) return
    isInitialized.current = true;

    (window as any).google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-client-id', // Replace with a real one or use dummy validation if testing
      callback: async (response: any) => {
        try {
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.credential }),
          })
          if (!res.ok) throw new Error('Authentication failed')
          const data = await res.json()
          setUser(data.user)
          toast.success('Successfully signed in!')
        } catch (error) {
          console.error(error)
          toast.error('Failed to sign in. Please try again.')
        }
      },
      cancel_on_tap_outside: false,
    })

    (window as any).google.accounts.id.prompt()
  }, [setUser])

  return null
}
