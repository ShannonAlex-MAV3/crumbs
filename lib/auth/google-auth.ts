import { TokenPayload } from "google-auth-library";
import { upsertUser } from "../user/user";
import { googleClient } from "./google-client";
import { createSession } from "./session";
import { VerifiedGooglePayload } from "@/types/user";
import { InvalidTokenError } from "../error/errors";

export async function signInWithGoogleIdToken(idToken?: string | null): Promise<void> {
    if (!idToken) throw new InvalidTokenError();

    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();
    assertValidPayload(payload);

    const user = await upsertUser(payload);

    await createSession({
        userId: user.id,
        name: user.name || "",
        email: user.email
    });
}

function assertValidPayload(
    payload: TokenPayload | undefined
): asserts payload is VerifiedGooglePayload {
    if (!payload) throw new InvalidTokenError("No payload in ID token");
    if (!payload.email) throw new InvalidTokenError("Invalid token payload: missing email");
}