'use client'

import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useCallback, useEffect, useRef } from 'react'
import { oneTapCallback } from './utils/callback'

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string
    callback: (response: { credential: string }) => void
    cancel_on_tap_outside?: boolean
    context?: string
    itp_support?: boolean
  }) => void
  prompt: () => void
  cancel: () => void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } }
  }
}

export function GoogleOneTap() {
  const router = useRouter();
  const isInitialized = useRef(false);

  const initializeGoogleOneTap = useCallback(() => {
    if (isInitialized.current) return;
    if (typeof window === 'undefined' || !window.google?.accounts) return;
    isInitialized.current = true;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: (response: { credential: string }) =>
        oneTapCallback(response, () => {
          router.replace('/dashboard')
        }),
      cancel_on_tap_outside: false,
      context: 'signin',
      itp_support: true,
    });

    window.google.accounts.id.prompt();
  }, [router]);

  useEffect(() => {
    initializeGoogleOneTap();

    return () => {
      window.google?.accounts.id.cancel();
      isInitialized.current = false;
    }
  }, [initializeGoogleOneTap]);

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={initializeGoogleOneTap}
    />
  )
}