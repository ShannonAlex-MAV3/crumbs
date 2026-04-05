import { toast } from "sonner"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function oneTapCallback(response: { credential: string }, onSuccess?: (data: any) => void, onError?: (error: any) => void) {
    try {
        const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.credential }),
        })
        if (!res.ok) throw new Error('Authentication failed')
        toast.success('Successfully signed in!')
        const data = await res.json()
        onSuccess?.(data)
    } catch (error) {
        console.error(error)
        toast.error('Failed to sign in. Please try again.')
        onError?.(error)
    }
}