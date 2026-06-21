// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(req: NextRequest) {
    if (req.nextUrl.pathname.startsWith("/") || req.nextUrl.pathname.startsWith("/api/auth") || req.nextUrl.pathname.startsWith("/api/me")) {
        return NextResponse.next();
    }

    const token = req.cookies.get("session")?.value;
    console.log("Proxy check for path:", req.nextUrl.pathname, "Token present:", token);

    if (!token) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET!);
        return NextResponse.next();
    } catch {
        console.warn("Invalid token, redirecting to landing page");
        return NextResponse.redirect(new URL("/", req.url));
    }
}

// allow css and public files to be accessed without authentication
export const config = {
    matcher: ["/((?!landing|api/auth|_next/static|favicon.ico).*)"],
};
