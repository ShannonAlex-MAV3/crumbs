import prisma from '@/lib/prisma'
import { Provider } from '@/types/common'
import { BaseUser } from '@/types/user'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)

export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    let payload
    try {
      if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        })
        payload = ticket.getPayload()
      } else {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
      }
    } catch (e) {
      console.error("Token verification failed", e)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!payload?.email) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 })
    }

    let dbUser = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || '',
          picture: payload.picture || '',
          provider: Provider.GOOGLE,
          providerUserId: payload.sub,
        },
      })
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

    return NextResponse.json({ ...user })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
