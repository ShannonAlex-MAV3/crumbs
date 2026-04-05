'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { GoogleOneTap } from '@/components/GoogleOneTap'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, LogOut, ArrowUpRight, ArrowDownRight, Users, Link2, CheckCircle2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Home() {
  const { user, setUser, isLoading, setIsLoading } = useAppStore()

  useEffect(() => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user)
      })
      .catch(() => console.error('Failed to fetch session'))
      .finally(() => setIsLoading(false))
  }, [setUser, setIsLoading])

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    setUser(null)
    toast.success('Logged out successfully')
  }

  if (isLoading) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <div className="animate-pulse w-16 h-16 rounded-full bg-primary/20"></div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-screen px-4">
        <GoogleOneTap />
        <div className="absolute top-8 left-8">
          <div className="text-2xl font-bold tracking-tighter">crumbs.</div>
        </div>
        <div className="text-center max-w-2xl space-y-8 relative z-10">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
            ✨ Next Generation Tracker
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
            Split <span className="text-primary italic px-2">simply.</span><br />
            Track seamlessly.
          </h1>
          <p className="text-xl text-muted-foreground max-w-[600px] mx-auto leading-relaxed">
            Beautifully designed expense and income tracking. Configure splits with friends and settle up effortlessly.
          </p>
          <div className="pt-8">
            <Button size="lg" className="rounded-full px-8 h-12 text-lg shadow-[0_0_40px_rgba(var(--primary),0.3)] transition-all hover:scale-105" onClick={() => {
              if (typeof window !== 'undefined' && (window as any).google) {
                (window as any).google.accounts.id.prompt()
              } else {
                toast.error('Google Auth is loading. Please wait.')
              }
            }}>
              Continue with Google
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 container max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center justify-between">
        <div className="text-2xl font-bold tracking-tighter">crumbs.</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2 hidden sm:inline-block">Hello, {user.name}</span>
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarImage src={user.picture || ''} />
              <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <Dashboard />
    </main>
  )
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [transactions, setTransactions] = useState<any[]>([])
  const [splits, setSplits] = useState<any[]>([])
  
  const fetchDashboardData = async () => {
    const [txns, sp] = await Promise.all([
      fetch('/api/transactions').then(res => res.json()),
      fetch('/api/splits').then(res => res.json())
    ])
    setTransactions(txns)
    setSplits(sp)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const balances = transactions.reduce((acc, curr) => {
    if (curr.type === 'INC') acc.income += curr.amount
    else acc.expense += curr.amount
    return acc
  }, { income: 0, expense: 0 })

  return (
    <div className="space-y-8 mt-8">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <AddTransactionModal onAdded={fetchDashboardData} type="INC" />
          <AddTransactionModal onAdded={fetchDashboardData} type="EXP" />
          <AddSplitModal onAdded={fetchDashboardData} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <div className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balances.income - balances.expense >= 0 ? 'text-primary' : 'text-destructive'}`}>
              ${(balances.income - balances.expense).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-500">Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balances.income.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Expenses</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balances.expense.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="overview">Transactions</TabsTrigger>
          <TabsTrigger value="splits">Splits</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-8">
          <Card className="bg-card/20 backdrop-blur-md border-white/10 dark:border-white/5">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No transactions yet.</p>
                ) : (
                  transactions.slice(0, 10).map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between p-4 rounded-xl bg-background/40 hover:bg-background/60 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${txn.type === 'INC' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                          {txn.type === 'INC' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{txn.category || (txn.type === 'INC' ? 'Income' : 'Expense')}</p>
                          <p className="text-sm text-muted-foreground">{txn.description}</p>
                        </div>
                      </div>
                      <div className={`font-semibold ${txn.type === 'INC' ? 'text-emerald-500' : 'text-destructive'}`}>
                        {txn.type === 'INC' ? '+' : '-'}${txn.amount.toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="splits" className="mt-8">
           <Card className="bg-card/20 backdrop-blur-md border-white/10 dark:border-white/5">
            <CardHeader>
              <CardTitle>Your Splits</CardTitle>
              <CardDescription>Outings and expenses shared with friends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {splits.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 col-span-full">No splits configured yet.</p>
                ) : (
                  splits.map((split) => {
                    const paidCount = split.participants.filter((p: any) => p.hasPaid).length
                    const totalParticipants = split.participants.length
                    const progress = paidCount / totalParticipants
                    
                    return (
                      <Card key={split.id} className="bg-background/40 border-white/5 hover:border-primary/20 transition-all group overflow-hidden">
                        <div className="absolute top-0 left-0 h-1 bg-primary transition-all" style={{ width: `${progress * 100}%` }} />
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                          <div>
                            <CardTitle className="text-lg">{split.description || 'Split Outing'}</CardTitle>
                            <CardDescription className="flex flex-col gap-1 mt-1">
                              <span>${split.totalAmount.toFixed(2)} total</span>
                              <span className="text-xs">{new Date(split.date).toLocaleDateString()}</span>
                            </CardDescription>
                          </div>
                          <div className="p-2 bg-primary/10 text-primary rounded-full">
                            <Users className="h-4 w-4" />
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="text-sm font-medium flex justify-between">
                              <span className="text-muted-foreground">Participants</span>
                              <span className="text-primary">{paidCount}/{totalParticipants} paid</span>
                            </div>
                            <div className="space-y-2">
                              {split.participants.map((p: any) => (
                                <div key={p.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-black/5 dark:bg-white/5">
                                  <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${p.hasPaid ? 'bg-emerald-500' : 'bg-orange-400'}`} />
                                    <span>{p.name}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono">${p.amountOwed.toFixed(2)}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 relative text-muted-foreground hover:text-primary transition-colors"
                                      onClick={() => {
                                        const url = `${window.location.origin}/pay/${p.secureToken}`
                                        navigator.clipboard.writeText(url)
                                        toast.success(`Copied payment link for ${p.name}!`)
                                      }}
                                    >
                                      <Link2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AddTransactionModal({ onAdded, type }: { onAdded: () => void, type: 'INC' | 'EXP' }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          amount: formData.get('amount'),
          category: formData.get('category'),
          description: formData.get('description'),
          type,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (!res.ok) throw new Error('Failed to save')
      toast.success(type === 'INC' ? 'Income added' : 'Expense added')
      setOpen(false)
      onAdded()
    } catch (e) {
      toast.error('Error saving transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-expect-error asChild type issue with React 19 */}
      <DialogTrigger asChild>
        <Button variant={type === 'INC' ? 'outline' : 'default'} className="flex-1 sm:flex-none h-10 px-4 rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          {type === 'INC' ? 'Income' : 'Expense'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-white/10 bg-background/80 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Add {type === 'INC' ? 'Income' : 'Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input id="amount" name="amount" type="number" step="0.01" required placeholder="0.00" className="text-xl h-12" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" required placeholder="e.g. Salary, Groceries" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input id="description" name="description" placeholder="Notes..." />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddSplitModal({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [participants, setParticipants] = useState([{ name: '', amountOwed: '' }])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    // validate
    const validParticipants = participants.filter(p => p.name && p.amountOwed)
    if (validParticipants.length === 0) {
      toast.error('Add at least one friend')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/splits', {
        method: 'POST',
        body: JSON.stringify({
          amount: formData.get('amount'),
          description: formData.get('description'),
          participants: validParticipants,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (!res.ok) throw new Error('Failed to create split')
      toast.success('Split created! You can now share the links.')
      setOpen(false)
      setParticipants([{ name: '', amountOwed: '' }])
      onAdded()
    } catch (e) {
      toast.error('Error creating split')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="flex-1 sm:flex-none h-10 px-4 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
          <Users className="h-4 w-4 mr-2" />
          Split Bill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-white/10 bg-background/80 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Create a Split</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Total Amount ($)</Label>
            <Input id="amount" name="amount" type="number" step="0.01" required placeholder="0.00" className="text-xl h-12" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">What was it for?</Label>
            <Input id="description" name="description" required placeholder="Dinner at Joe's" />
          </div>
          
          <div className="space-y-3 pt-2 border-t border-white/10">
             <Label>Friends to split with</Label>
             {participants.map((p, i) => (
               <div key={i} className="flex gap-2">
                 <Input placeholder="Name" value={p.name} onChange={(e) => {
                   const nw = [...participants]; nw[i].name = e.target.value; setParticipants(nw);
                 }} />
                 <Input type="number" step="0.01" placeholder="$ Amount" className="w-24" value={p.amountOwed} onChange={(e) => {
                   const nw = [...participants]; nw[i].amountOwed = e.target.value; setParticipants(nw);
                 }} />
               </div>
             ))}
             <Button type="button" variant="ghost" size="sm" onClick={() => setParticipants([...participants, { name: '', amountOwed: '' }])}>
               + Add another
             </Button>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 mt-4">
            {loading ? 'Creating...' : 'Create Split'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
