'use client'

import { useEffect, useState, use } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, UserCircle2, Receipt, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { GoogleOneTap } from '@/components/GoogleOneTap'
import { useAppStore } from '@/lib/store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function PaySplitPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter()
  const { token } = use(params)
  const user = useAppStore((s) => s.user)
  const setUser = useAppStore((s) => s.setUser)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch(`/api/splits/${token}`).then((res) => res.json()),
      fetch('/api/auth').then((res) => res.json()),
    ])
      .then(([splitPayload, authPayload]) => {
        if (cancelled) return
        setData(splitPayload)
        if (authPayload?.user) {
          setUser(authPayload.user)
        }
      })
      .catch(() => {
        if (!cancelled) setData(null)
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
          setAuthChecked(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [token, setUser])

  // Other participants (excluding the current one)
  const otherParticipants = data?.split?.participants?.filter((p: any) => p.id !== data.id) ?? []

  const promptGoogleSignIn = () => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      ;(window as any).google.accounts.id.prompt()
    } else {
      toast.error('Google sign-in is still loading. Try again in a moment.')
    }
  }

  const handlePay = async () => {
    if (!user) {
      toast.error('Sign in with Google to complete this payment and save it to your account.')
      promptGoogleSignIn()
      return
    }
    setPaying(true)
    try {
      const res = await fetch(`/api/splits/${token}`, { method: 'POST', credentials: 'include' })
      if (res.status === 401) {
        setUser(null)
        toast.error('Please sign in to continue.')
        promptGoogleSignIn()
        setPaying(false)
        return
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to pay')
      }
      toast.success('Paid! The expense is saved on your account.')
      setData({ ...data, hasPaid: true, userId: user.id })
      setPaying(false)
    } catch (e: any) {
      toast.error(e?.message || 'Gosh, something went wrong. Try again.')
      setPaying(false)
    }
  }

  const needsSignIn = authChecked && data && !data.error && !data.hasPaid && !user

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse w-16 h-16 rounded-full bg-primary/20"></div>
      </main>
    )
  }

  if (!data || data.error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-muted-foreground">The split link is invalid or has expired.</p>
          <Button onClick={() => router.push('/')} variant="outline">Go to home</Button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {needsSignIn ? <GoogleOneTap /> : null}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] max-w-[800px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center flex items-center justify-center gap-2">
          <div className="text-xl font-bold tracking-tighter">crumbs.</div>
        </div>
        <Card className="bg-card/40 backdrop-blur-3xl shadow-2xl border-white/10 dark:border-white/5 rounded-3xl overflow-hidden mt-8">
          <CardHeader className="text-center space-y-2 pt-8 pb-4">
            <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-4">
              <UserCircle2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-medium tracking-tight">Hey {data.name},</CardTitle>
            <CardDescription className="text-base">
              {data.split.creator.name} requested a split for <br />
              <span className="font-semibold text-foreground">{data.split.description || 'an expense'}</span>
            </CardDescription>
            {data.note && (
              <p className="text-sm text-muted-foreground mt-1 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5">
                📌 {data.note}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <div className="text-center pt-4 pb-2">
              <span className="text-muted-foreground text-sm uppercase tracking-widest font-semibold block mb-2">Your Share</span>
              <span className={`text-6xl font-bold tracking-tighter ${data.hasPaid ? 'text-emerald-500' : 'text-primary'}`}>
                Rs. {data.amountOwed.toFixed(2)}
              </span>
            </div>

            {/* Bill Summary */}
            <div className="rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                <Receipt className="h-4 w-4" />
                <span>Bill Summary</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Bill</span>
                <span className="font-semibold">Rs. {data.split.totalAmount.toFixed(2)}</span>
              </div>
              {otherParticipants.length > 0 && (
                <div className="border-t border-white/10 pt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Users className="h-3 w-3" />
                    <span>Other splits</span>
                  </div>
                  {otherParticipants.map((p: any) => (
                    <div key={p.id} className="space-y-0.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${p.hasPaid ? 'bg-emerald-500' : 'bg-orange-400'}`} />
                          <span className="text-muted-foreground">{p.name || 'Unknown'}</span>
                        </div>
                        <span className="font-mono text-xs">
                          Rs. {p.amountOwed.toFixed(2)}
                          {p.hasPaid && <span className="ml-1 text-emerald-500 text-[10px]">✓</span>}
                        </span>
                      </div>
                      {p.note && <p className="text-xs text-muted-foreground/70 pl-4 truncate">{p.note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {data.hasPaid ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <span className="font-semibold text-emerald-500 text-lg">Paid in full</span>
                <p className="text-sm text-emerald-500/80 text-center px-4">This balance has been settled and recorded.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {user ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/5 dark:bg-white/5 p-3">
                    <Avatar className="h-10 w-10 border border-primary/20">
                      <AvatarImage src={user.picture || ''} alt="" />
                      <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-medium truncate">{user.name || 'Signed in'}</p>
                      <p className="text-muted-foreground truncate text-xs">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3 text-center">
                    <p className="text-sm text-foreground">
                      Sign in with Google to mark this paid. We will create your account if you are new and add this payment as an expense on your side.
                    </p>
                    <Button type="button" className="w-full rounded-xl h-11" onClick={promptGoogleSignIn}>
                      Continue with Google
                    </Button>
                  </div>
                )}
                <Button
                  size="lg"
                  className="w-full rounded-2xl h-14 text-lg font-semibold shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:scale-[1.02] transition-all"
                  onClick={handlePay}
                  disabled={paying || !user}
                >
                  {paying ? 'Processing...' : 'Mark as Paid'}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  {user
                    ? `This records an expense on your account and income for ${data.split.creator.name}.`
                    : `After you sign in, confirming will save your share as an expense and notify ${data.split.creator.name}.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
