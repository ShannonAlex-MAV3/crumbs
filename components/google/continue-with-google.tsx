import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface Props {
  onClick?: () => void;
}

export default function ContinueWithGoogle(props: Props) {
  const { onClick } = props;

  const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);
  
    useEffect(() => {
      const handleGoogleAuthSuccess = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data.type !== "google-oauth-success") return;
  
        const user = await fetch("/api/me")
          .then((res) => res.json())
          .catch(() => null);
  
        setUser(user);
        toast.success("Signed in with Google");
        router.push("/dashboard");
      };
  
      window.addEventListener("message", handleGoogleAuthSuccess);
      return () => window.removeEventListener("message", handleGoogleAuthSuccess);
    }, [setUser, router]);

  const handleGoogleLogin = () => {
    const popup = window.open(
      "/api/auth/google",
      "google-auth",
      "popup=yes,width=500,height=650,menubar=no,toolbar=no,location=no,status=no",
    );

    // Fallback if popup was blocked by the browser.
    if (!popup) {
      window.location.href = "/api/auth/google";
    }
    onClick?.();
  };

  return (
    <div className="pt-8">
      <Button
        size="lg"
        className="rounded-full text-lg shadow-[0_0_40px_rgba(var(--primary),0.3)] transition-all hover:scale-105"
        onClick={handleGoogleLogin}
      >
        Continue with Google
      </Button>
    </div>
  );
}
