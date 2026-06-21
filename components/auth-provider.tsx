"use client";

import { useAuthStore } from "@/stores/auth";
import type { BaseUser } from "@/types/user";

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: BaseUser | null;
  children: React.ReactNode;
}) {
  const {user, setUser} = useAuthStore();
  if (!user) {
    setUser(initialUser);
  }
  return <>{children}</>;
}
