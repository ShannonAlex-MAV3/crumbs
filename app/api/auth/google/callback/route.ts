// app/api/auth/google/callback/route.ts
import { googleClient } from "@/lib/google-client";
import prisma from "@/lib/prisma";
import { Provider } from "@/types/common";
import { BaseUser } from "@/types/user";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    const appOrigin = new URL(req.url).origin;
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
        return new Response("Missing code", { status: 400 });
    }

    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();

    if (!payload) {
        return new Response("Invalid token", { status: 401 });
    }

    //Check if user exists in DB
    const dbUser = await prisma.user.findUnique({
        where: { email: payload.email },
        select: { email: true, name: true, picture: true }
    })

    if (!dbUser) {
        //Create user in DB
        await prisma.user.create({
            data: {
                email: payload.email!,
                name: payload.name,
                picture: payload.picture,
                provider: Provider.GOOGLE,
                providerUserId: payload.sub,
            },
        });
    }


    const user: BaseUser = {
        providerUserId: payload.sub,
        email: payload.email!,
        name: payload.name,
        picture: payload.picture,
        provider: Provider.GOOGLE,
    };

    const sessionToken = jwt.sign(
        user,
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
    );

    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });

    const html = `<!doctype html>
                    <html>
                        <head>
                            <meta charset="utf-8" />
                            <title>Signing you in...</title>
                        </head>
                        <body>
                            <script>
                                (function () {
                                    const appOrigin = ${JSON.stringify(appOrigin)};
                                    const targetPath = '/';
                                    const targetUrl = appOrigin + targetPath;

                                    try {
                                        if (window.opener && !window.opener.closed) {
                                            window.opener.postMessage({ type: 'google-oauth-success' }, appOrigin);
                                            window.close();
                                            return;
                                        }
                                    } catch (_) {}

                                    window.location.assign(targetUrl);
                                })();
                            </script>
                            <noscript>
                                <meta http-equiv="refresh" content="0;url=/" />
                            </noscript>
                        </body>
                    </html>`;

    return new Response(html, {
        headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-store",
        },
    });
}