import { googleClient } from '@/lib/google-client';

export async function GET() {
    const url = googleClient.generateAuthUrl({
        // access_type: "offline",
        scope: ["openid", "email", "profile"],
        prompt: "consent",
    });

    return Response.redirect(url);
}
