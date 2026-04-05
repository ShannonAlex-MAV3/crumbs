'use client'

import { useEffect, useState, use } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, UserCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function PaySplitPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter()
  const { token } = use(params)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    fetch(`/api/splits/${token}`)
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token])

  const handlePay = async () => {
    setPaying(true)
    try {
      const res = await fetch(`/api/splits/${token}`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to pay')
      toast.success('Successfully marked as paid!')
      setData({ ...data, hasPaid: true })
    } catch (e) {
      toast.error('Gosh, something went wrong. Try again.')
      setPaying(false)
    }
  }

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
              <span className="font-semibold text-foreground">{data.split.description}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 px-8 pb-8">
            <div className="text-center pt-4 pb-6">
               <span className="text-muted-foreground text-sm uppercase tracking-widest font-semibold block mb-2">Amount Due</span>
               <span className={`text-6xl font-bold tracking-tighter ${data.hasPaid ? 'text-emerald-500' : 'text-primary'}`}>
                 ${data.amountOwed.toFixed(2)}
               </span>
            </div>

            {data.hasPaid ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <span className="font-semibold text-emerald-500 text-lg">Paid in full</span>
                <p className="text-sm text-emerald-500/80 text-center px-4">This balance has been settled and recorded.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="w-full rounded-2xl h-14 text-lg font-semibold shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:scale-[1.02] transition-all" 
                  onClick={handlePay}
                  disabled={paying}
                >
                  {paying ? 'Processing...' : 'Mark as Paid'}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By clicking this, {data.split.creator.name} will be notified that you have settled your share.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
