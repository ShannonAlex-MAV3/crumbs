import { withErrorHandling } from '@/lib/error/api-error-handler';
import { GOOGLE_SCOPES, googleClient } from '@/lib/auth/google-client';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

export const GET = withErrorHandling(async () => {
    const state = randomBytes(16).toString("hex");

    // CSRF protection: store state in a short-lived cookie, verify on callback
    (await cookies()).set("oauth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 5, // 5 minutes
        path: "/",
    });

    const url = googleClient.generateAuthUrl({
        access_type: "offline",
        scope: GOOGLE_SCOPES,
        state: state,
        prompt: "consent",
    });

    return Response.redirect(url);
})
