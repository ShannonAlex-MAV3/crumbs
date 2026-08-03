import { withErrorHandling } from '@/lib/error/api-error-handler'
import { signInWithGoogleIdToken } from '@/lib/auth/google-auth'
import { NextResponse } from 'next/server'

export const POST = withErrorHandling(async (request: Request) => {
  const { token } = await request.json();
  await signInWithGoogleIdToken(token);
  return NextResponse.json({ success: true });
})
