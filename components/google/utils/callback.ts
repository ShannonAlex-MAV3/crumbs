import { AppError } from "@/lib/error/errors"
import { toast } from "sonner"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function oneTapCallback(response: { credential: string }, onSuccess?: (data: any) => void, onError?: (error: any) => void) {
    try {
        const res = await fetch('/api/auth/google/one-tap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.credential }),
        })
        const data = await res.json()

        if (!res.ok) throw new AppError(data?.error ?? 'Authentication failed', data?.code ?? 'UNKNOWN_ERROR', res.status)

        toast.success('Successfully signed in!')
        onSuccess?.(data)
    } catch (error) {
        console.error(error)
        toast.error(error instanceof Error ? error.message : 'Failed to sign in. Please try again.')
        onError?.(error)
    }
}