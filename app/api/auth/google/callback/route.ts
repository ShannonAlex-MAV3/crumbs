import { signInWithGoogleIdToken } from "@/lib/auth/google-auth";
import { googleClient } from "@/lib/auth/google-client";
import { AppError, BadRequestError } from "@/lib/error/errors";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    try {
        if (error) throw new BadRequestError(error, "OAUTH_PROVIDER_ERROR");

        const storedState = (await cookies()).get("oauth_state")?.value;
        if (!state || state !== storedState) throw new BadRequestError("Invalid state", "OAUTH_INVALID_STATE");

        (await cookies()).delete("oauth_state");

        if (!code) throw new BadRequestError("Missing code", "OAUTH_MISSING_CODE");

        const { tokens } = await googleClient.getToken(code);

        await signInWithGoogleIdToken(tokens.id_token);

        return popupResponse("google-oauth-success", "/dashboard");
    } catch (err) {
        const code = err instanceof AppError ? err.code : "UNKNOWN_ERROR";
        console.error(`OAuth callback error [${code}]:`, err);
        return popupResponse("google-oauth-error", "/");
    }
}

function popupResponse(messageType: "google-oauth-success" | "google-oauth-error", fallbackPath: string) {
    const html = `<!DOCTYPE html>
                    <html>
                        <body>
                        <script>
                        if (window.opener) {
                            window.opener.postMessage({ type: "${messageType}" }, window.location.origin);
                            window.close();
                        } else {
                            window.location.href = "${fallbackPath}";
                        }
                        </script>
                        </body>
                    </html>`;
    return new Response(html, { headers: { "Content-Type": "text/html" } });
}