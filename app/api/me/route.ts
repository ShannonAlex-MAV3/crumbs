import { withAuth } from "@/lib/auth/with-auth"
import { getCurrentUser } from "@/lib/user/user"
import { NextResponse } from "next/server"

export const GET = withAuth(async (session) => {
    const user = await getCurrentUser(session);
    return NextResponse.json(user);
})