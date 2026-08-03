import { AuthProvider } from "@/components/auth-provider";
import { getCurrentUser } from "@/lib/user/user";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  return <AuthProvider user={user}>{children}</AuthProvider>;
}
