"use client";

import { AuthStoreContext, createAuthStore } from "@/stores/auth";
import type { UserDetails } from "@/types/user";
import { useState } from "react";

export function AuthProvider({
  user,
  children,
}: {
  user: UserDetails | null;
  children: React.ReactNode;
}) {
  const [store] = useState(() => createAuthStore({ user }));

  return (
    <AuthStoreContext.Provider value={store}>
      {children}
    </AuthStoreContext.Provider>
  );
}
