"use client";

import { useAuthStore } from "@/stores/auth";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Dashboard() {
  const router = useRouter();
  const { user, setUser } = useAuthStore((state) => state);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth", { method: "DELETE" });
      if (!res.ok) {
        toast.error("Logout Error");
        return;
      }
    } catch {
      toast.error("Logout Error");
      return;
    }
    setUser(null);
    router.replace("/");
    toast.success("Logout Successfully");
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex justify-center items-center gap-3">
          Hi {user?.name}!, you can now access the dashboard.{" "}
          <button type="button" className="p-2 rounded-lg hover:bg-gray-700" onClick={handleLogout} aria-label="Log out">
            <LogOut />
          </button>
        </div>
      </main>
    </div>
  );
}
