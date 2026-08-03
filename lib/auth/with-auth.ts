import { withErrorHandling } from "@/lib/error/api-error-handler";
import { SessionPayload } from "@/types/user";
import { destroySession, getSession } from "./session";

/**
 * Wraps a Route Handler so it only runs for an authenticated request,
 * with the verified session passed in as the first argument - instead of
 * each route needing its own `getSession()` call to gate access.
 *
 * Includes `withErrorHandling`, since `getSession()` throwing
 * `UnauthenticatedError` needs to be caught to map to a 401 rather than
 * surfacing as an unhandled 500.
 */
export function withAuth<Args extends unknown[]>(
    handler: (session: SessionPayload, ...args: Args) => Promise<Response>
) {
    return withErrorHandling(async (...args: Args): Promise<Response> => {
        let session: SessionPayload;
        try {
            session = await getSession();
        } catch (error) {
            await destroySession();
            throw error;
        }
        return handler(session, ...args);
    });
}
