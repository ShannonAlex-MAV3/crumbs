import { SessionPayload } from "@/types/user";
import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import { UnauthenticatedError } from "../error/errors";

const COOKIE_NAME = "session";
const JWE_ENC = "A256GCM";
export const JWE_ALG = "PBES2-HS512+A256KW";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is not set");
}
export const secret = new TextEncoder().encode(jwtSecret);

export async function createSession(user: SessionPayload) {
    const token = await new EncryptJWT(user)
        .setProtectedHeader({ alg: JWE_ALG, enc: JWE_ENC })
        .setIssuedAt()
        .setExpirationTime("1h")
        .encrypt(secret);

    (await cookies()).set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 1,
    });
}

export async function getSession(): Promise<SessionPayload> {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) throw new UnauthenticatedError();

    try {
        const { payload } = await jwtDecrypt(token, secret, {
            keyManagementAlgorithms: [JWE_ALG],
        });
        return payload as unknown as SessionPayload;
    } catch {
        throw new UnauthenticatedError();
    }
}

export async function destroySession() {
    (await cookies()).delete(COOKIE_NAME);
}