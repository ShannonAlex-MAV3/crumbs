import { TokenPayload } from "google-auth-library";

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  [key: string]: unknown;
}

export type UserDetails = {
    email: string | null;
    name?: string;
    picture?: string;
}

export type VerifiedGooglePayload = TokenPayload & { email: string };