import { withErrorHandling } from "@/lib/error/api-error-handler"
import { destroySession } from "@/lib/auth/session"
import { NextResponse } from "next/server"

export const DELETE = withErrorHandling(async () => {
  await destroySession();
  return NextResponse.json({ success: true })
})