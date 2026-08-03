import { jwtDecrypt } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { JWE_ALG, secret } from "./lib/auth/session";


export async function proxy(req: NextRequest) {
    const token = req.cookies.get("session")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    try {
        await jwtDecrypt(token, secret, { keyManagementAlgorithms: [JWE_ALG] });
        return NextResponse.next();
    } catch (error){
        console.error("Token Verification Failed: ", error);
        const response = NextResponse.redirect(new URL("/", req.url));
        response.cookies.delete("session");
        return response;
    }
}

// only run the auth gate on pages that actually require a session;
// add new protected routes to this list as they're created
export const config = {
    matcher: ["/dashboard/:path*"],
};
