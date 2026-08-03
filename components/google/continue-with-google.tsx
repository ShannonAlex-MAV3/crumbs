import { Icon } from "@iconify/react";
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

  useEffect(() => {
    const handleGoogleAuth = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type == "google-oauth-error") {
        toast.error("Authentication Failed");
        return;
      }

      if (event.data.type !== "google-oauth-success") return;

      toast.success("Signed in with Google");
      router.push("/dashboard");
    };

    window.addEventListener("message", handleGoogleAuth);
    return () => window.removeEventListener("message", handleGoogleAuth);
  }, [router]);

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
    <Button
      size="lg"
      className="rounded-full py-6 px-4 text-lg shadow-[0_0_40px_rgba(var(--primary),0.3)] transition-all hover:scale-105"
      onClick={handleGoogleLogin}
    >
      Continue with <Icon icon="selfhst:google" />
    </Button>
  );
}
