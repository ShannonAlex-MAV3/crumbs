"use client";

import ContinueWithGoogle from "@/components/google/continue-with-google";
import { GoogleOneTap } from "@/components/google/one-tap";

export default function GoogleLoginButton() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen px-4">
      <GoogleOneTap />
      <div className="absolute top-8 left-8">
        <div className="text-2xl font-bold tracking-tighter">crumbs.</div>
      </div>
      <div className="text-center max-w-2xl space-y-8 relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
          Split <span className="text-primary italic px-2">simply.</span>
          <br />
          Track seamlessly.
        </h1>
        <p className="text-xl text-muted-foreground max-w-150 mx-auto leading-relaxed">
          Beautifully designed expense and income tracking. Configure splits with friends and settle up effortlessly.
        </p>
        <ContinueWithGoogle />
      </div>
    </main>
  );
}
