'use client'

import { useAppStore } from '@/lib/store'
import Script from 'next/script'
import { useCallback, useEffect, useRef } from 'react'
import { oneTapCallback } from './utils/callback'

export function GoogleOneTap() {
  const setUser = useAppStore((state) => state.setUser)
  const isInitialized = useRef(false)

  const initializeGoogleOneTap = useCallback(() => {
    if (isInitialized.current) return
    if (typeof window === 'undefined' || !(window as any).google || !(window as any).google.accounts) return
    isInitialized.current = true;

    (window as any).google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: (response: { credential: string }) => oneTapCallback(response, setUser),
      cancel_on_tap_outside: false,
      context: 'signin',
      itp_support: true,
    });

    (window as any).google.accounts.id.prompt()
  }, [setUser])

  useEffect(() => {
    initializeGoogleOneTap()
  }, [setUser, initializeGoogleOneTap])

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={initializeGoogleOneTap}
    />
  )
}
