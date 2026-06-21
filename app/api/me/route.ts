import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken";
import { BaseUser } from "@/types/user";
import prisma from "@/lib/prisma";

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value
    console.log("GET /api/me called, token present:", !!token)

    if (!token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // decode the token to get user information
    let email: string | null = null
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as BaseUser
        console.log("Decoded token:", decoded)
        email = decoded.email
    } catch (e) {
        console.error("Token verification failed", e)
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!email) {
        return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 })
    }


    const user = await prisma.user.findUnique({
        where: { email: email },
        select: { email: true, name: true, picture: true }
    })

    return NextResponse.json({ ...user })
}