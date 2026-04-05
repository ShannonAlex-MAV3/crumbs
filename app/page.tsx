"use client";

import { GoogleOneTap } from "@/components/google/one-tap";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { isSplitPaymentIncome } from "@/lib/transaction-policy";
import { ArrowDownRight, ArrowUpRight, Check, Link2, Lock, LogOut, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const { user, setUser, isLoading, setIsLoading } = useAppStore();

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => console.error("Failed to fetch session"))
      .finally(() => setIsLoading(false));
  }, [setUser, setIsLoading]);

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    setUser(null);
    toast.success("Logged out successfully");
  };

  if (isLoading) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <div className="animate-pulse w-16 h-16 rounded-full bg-primary/20"></div>
      </main>
    );
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
            Split <span className="text-primary italic px-2">simply.</span>
            <br />
            Track seamlessly.
          </h1>
          <p className="text-xl text-muted-foreground max-w-[600px] mx-auto leading-relaxed">
            Beautifully designed expense and income tracking. Configure splits with friends and settle up effortlessly.
          </p>
          {/* <ContinueWithGoogle /> */}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 container max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center justify-between">
        <div className="text-2xl font-bold tracking-tighter">crumbs.</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2 hidden sm:inline-block">Hello, {user.name}</span>
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarImage src={user.picture || ""} />
              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <Dashboard />
    </main>
  );
}

function TransactionRow({ txn, onSaved }: { txn: any; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const locked = isSplitPaymentIncome(txn);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/transactions/${txn.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: formData.get("amount"),
          category: formData.get("category"),
          description: formData.get("description"),
          date: formData.get("date") || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update");
      }
      toast.success("Transaction updated");
      setOpen(false);
      onSaved();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const dateStr = txn.date ? new Date(txn.date).toISOString().slice(0, 10) : "";

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${txn.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete");
      }
      toast.success("Transaction deleted");
      setDeleteOpen(false);
      onSaved();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-background/40 hover:bg-background/60 transition-colors">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div
          className={`p-2 rounded-full flex-shrink-0 ${txn.type === "INC" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}
        >
          {txn.type === "INC" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        </div>
        <div className="min-w-0">
          <p className="font-medium">{txn.category || (txn.type === "INC" ? "Income" : "Expense")}</p>
          <p className="text-sm text-muted-foreground truncate">{txn.description || "—"}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <div className={`font-semibold tabular-nums ${txn.type === "INC" ? "text-emerald-500" : "text-destructive"}`}>
          {txn.type === "INC" ? "+" : "-"}Rs. {txn.amount.toFixed(2)}
        </div>
        {locked ? (
          <div
            className="h-8 w-8 flex items-center justify-center text-muted-foreground"
            title="Income from split payments cannot be edited or deleted"
          >
            <Lock className="h-4 w-4" />
          </div>
        ) : (
          <>
            <Dialog open={open} onOpenChange={setOpen}>
              {/* @ts-expect-error asChild type issue with React 19 */}
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] border-white/10 bg-background/80 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle>Edit transaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor={`amt-${txn.id}`}>Amount (Rs.)</Label>
                    <Input
                      id={`amt-${txn.id}`}
                      name="amount"
                      type="number"
                      step="0.01"
                      required
                      defaultValue={String(txn.amount)}
                      className="text-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`cat-${txn.id}`}>Category</Label>
                    <Input
                      id={`cat-${txn.id}`}
                      name="category"
                      required
                      defaultValue={txn.category || ""}
                      placeholder="e.g. Salary, Groceries"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`desc-${txn.id}`}>Description</Label>
                    <Input
                      id={`desc-${txn.id}`}
                      name="description"
                      defaultValue={txn.description || ""}
                      placeholder="Notes..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`date-${txn.id}`}>Date</Label>
                    <Input id={`date-${txn.id}`} name="date" type="date" defaultValue={dateStr} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-11">
                    {loading ? "Saving..." : "Save changes"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              {/* @ts-expect-error asChild type issue with React 19 */}
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  title="Delete transaction"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px] border-white/10 bg-background/80 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle>Delete transaction?</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground pt-2">This cannot be undone.</p>
                <div className="flex gap-2 justify-end pt-6">
                  <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
                    {deleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}

function SplitCardItem({ split, onChanged }: { split: any; onChanged: () => void }) {
  const paidCount = split.participants.filter((p: any) => p.hasPaid).length;
  const totalParticipants = split.participants.length;
  const progress = totalParticipants > 0 ? paidCount / totalParticipants : 0;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const removeSplit = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/splits?id=${encodeURIComponent(split.id)}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete split");
      }
      toast.success("Split deleted");
      setDeleteOpen(false);
      onChanged();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete split");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="relative bg-background/40 border-white/5 hover:border-primary/20 transition-all group overflow-hidden">
      <div className="absolute top-0 left-0 h-1 bg-primary transition-all" style={{ width: `${progress * 100}%` }} />
      <CardHeader className="flex flex-row items-start justify-between pb-2 gap-2">
        <div className="min-w-0">
          <CardTitle className="text-lg">{split.description || "Split Outing"}</CardTitle>
          <CardDescription className="flex flex-col gap-1 mt-1">
            <span>Rs. {split.totalAmount.toFixed(2)} total</span>
            <span className="text-xs">{new Date(split.date).toLocaleDateString()}</span>
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            {/* @ts-expect-error asChild type issue with React 19 */}
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                title="Delete split"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] border-white/10 bg-background/80 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle>Delete this split?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground pt-2">
                This removes the split, all participants, and every transaction linked to this split (including split
                payments). Anyone with an old pay link will no longer be able to use it.
              </p>
              <div className="flex gap-2 justify-end pt-6">
                <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="destructive" onClick={removeSplit} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete split"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <div className="p-2 bg-primary/10 text-primary rounded-full">
            <Users className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="text-sm font-medium flex justify-between">
            <span className="text-muted-foreground">Participants</span>
            <span className="text-primary">
              {paidCount}/{totalParticipants} paid
            </span>
          </div>
          <div className="space-y-2">
            {split.participants.map((p: any) => (
              <ParticipantRow key={p.id} p={p} onSaved={onChanged} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ParticipantRow({ p, onSaved }: { p: any; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(p.name || "");
  const [amount, setAmount] = useState(String(p.amountOwed));
  const [note, setNote] = useState(p.note || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/splits/${p.secureToken}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, amountOwed: parseFloat(amount), note }),
      });
      if (!res.ok) throw new Error();
      toast.success("Participant updated");
      setEditing(false);
      onSaved();
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setName(p.name || "");
    setAmount(String(p.amountOwed));
    setNote(p.note || "");
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-primary/5 border border-primary/20 text-sm">
        <div className="flex gap-2">
          <Input
            className="h-7 text-xs px-2"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            className="h-7 text-xs px-2 w-28"
            type="number"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <Input
          className="h-7 text-xs px-2"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex gap-2 justify-end pt-0.5">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={cancel}
          >
            <X className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-emerald-500 hover:text-emerald-400"
            onClick={save}
            disabled={saving}
          >
            <Check className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-black/5 dark:bg-white/5 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full flex-shrink-0 ${p.hasPaid ? "bg-emerald-500" : "bg-orange-400"}`} />
          <span className="font-medium">{p.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs">Rs. {p.amountOwed.toFixed(2)}</span>
          {p.hasPaid ? (
            <div
              className="h-6 w-6 flex items-center justify-center text-emerald-500"
              title="Already paid — cannot edit"
            >
              <Lock className="h-3 w-3" />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
          {!p.hasPaid && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => {
                const url = `${window.location.origin}/pay/${p.secureToken}`;
                navigator.clipboard.writeText(url);
                toast.success(`Copied payment link for ${p.name}!`);
              }}
            >
              <Link2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      {p.note && <p className="text-xs text-muted-foreground pl-4">{p.note}</p>}
    </div>
  );
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [splits, setSplits] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    const [txns, sp] = await Promise.all([
      fetch("/api/transactions").then((res) => res.json()),
      fetch("/api/splits").then((res) => res.json()),
    ]);
    setTransactions(txns);
    setSplits(sp);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const balances = transactions.reduce(
    (acc, curr) => {
      if (curr.type === "INC") acc.income += curr.amount;
      else acc.expense += curr.amount;
      return acc;
    },
    { income: 0, expense: 0 },
  );

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
            <div
              className={`text-2xl font-bold ${balances.income - balances.expense >= 0 ? "text-primary" : "text-destructive"}`}
            >
              Rs. {(balances.income - balances.expense).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-500">Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {balances.income.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Expenses</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs.{balances.expense.toFixed(2)}</div>
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
                  transactions
                    .slice(0, 10)
                    .map((txn) => <TransactionRow key={txn.id} txn={txn} onSaved={fetchDashboardData} />)
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
                  splits.map((split) => <SplitCardItem key={split.id} split={split} onChanged={fetchDashboardData} />)
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AddTransactionModal({ onAdded, type }: { onAdded: () => void; type: "INC" | "EXP" }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          amount: formData.get("amount"),
          category: formData.get("category"),
          description: formData.get("description"),
          type,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to save");
      toast.success(type === "INC" ? "Income added" : "Expense added");
      setOpen(false);
      onAdded();
    } catch (e) {
      toast.error("Error saving transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-expect-error asChild type issue with React 19 */}
      <DialogTrigger asChild>
        <Button variant={type === "INC" ? "outline" : "default"} className="flex-1 sm:flex-none h-10 px-4 rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          {type === "INC" ? "Income" : "Expense"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-white/10 bg-background/80 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Add {type === "INC" ? "Income" : "Expense"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (Rs.)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              className="text-xl h-12"
            />
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
            {loading ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddSplitModal({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState([{ name: "", amountOwed: "", note: "" }]);
  const [myShare, setMyShare] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    // validate
    const validParticipants = participants.filter((p) => p.name && p.amountOwed);
    if (validParticipants.length === 0) {
      toast.error("Add at least one friend with a name and amount");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/splits", {
        method: "POST",
        body: JSON.stringify({
          amount: formData.get("amount"),
          description: formData.get("description"),
          myShare: myShare ? parseFloat(myShare) : null,
          participants: validParticipants,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to create split");
      toast.success("Split created! You can now share the links.");
      setOpen(false);
      setParticipants([{ name: "", amountOwed: "", note: "" }]);
      setMyShare("");
      onAdded();
    } catch (e) {
      toast.error("Error creating split");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-expect-error asChild type issue with React 19 */}
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="flex-1 sm:flex-none h-10 px-4 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
        >
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
            <Label htmlFor="amount">Total Amount (Rs.)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              className="text-xl h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              What was it for? <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input id="description" name="description" placeholder="Dinner at Joe's" />
          </div>

          <div className="space-y-3 pt-2 border-t border-white/10">
            <Label>My share</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="Rs. My allocated amount (optional)"
              value={myShare}
              onChange={(e) => setMyShare(e.target.value)}
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-white/10">
            <Label>Friends to split with</Label>
            {participants.map((p, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <Input
                    placeholder="Name"
                    value={p.name}
                    onChange={(e) => {
                      const nw = [...participants];
                      nw[i].name = e.target.value;
                      setParticipants(nw);
                    }}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Rs. Am."
                    className="w-24"
                    value={p.amountOwed}
                    onChange={(e) => {
                      const nw = [...participants];
                      nw[i].amountOwed = e.target.value;
                      setParticipants(nw);
                    }}
                  />
                </div>
                <Input
                  placeholder="Note (optional) — what do they owe this for?"
                  className="text-xs h-8"
                  value={p.note}
                  onChange={(e) => {
                    const nw = [...participants];
                    nw[i].note = e.target.value;
                    setParticipants(nw);
                  }}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setParticipants([...participants, { name: "", amountOwed: "", note: "" }])}
            >
              + Add another
            </Button>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 mt-4">
            {loading ? "Creating..." : "Create Split"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
