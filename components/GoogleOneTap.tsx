'use client'

import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import Script from 'next/script'

export function GoogleOneTap() {
  const setUser = useAppStore((state) => state.setUser)
  const isInitialized = useRef(false)

  const initializeGoogleOneTap = () => {
    if (isInitialized.current) return
    if (typeof window === 'undefined' || !(window as any).google || !(window as any).google.accounts) return
    isInitialized.current = true;

    (window as any).google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
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
      context: 'signin',
      use_fedcm_for_prompt: true,
      itp_support: true,
    });

    (window as any).google.accounts.id.prompt()
  }

  useEffect(() => {
    // Attempt to initialize if the script is already loaded
    initializeGoogleOneTap()
  }, [setUser])

  return (
    <Script 
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={initializeGoogleOneTap}
    />
  )
}
