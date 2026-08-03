import { NextResponse } from "next/server";
import { AppError } from "./errors";

/**
 * Wraps a Route Handler so every AppError maps to its own status/code/message
 * as JSON, and anything else falls back to a generic 500 - instead of each
 * route needing its own try/catch to avoid an unshaped framework 500.
 */
export function withErrorHandling<Args extends unknown[]>(
    handler: (...args: Args) => Promise<Response>
) {
    return async (...args: Args): Promise<Response> => {
        try {
            return await handler(...args);
        } catch (error) {
            if (error instanceof AppError) {
                return NextResponse.json(
                    { error: error.message, code: error.code },
                    { status: error.status }
                );
            }

            console.error("Unhandled API error:", error);
            return NextResponse.json(
                { error: "Internal server error", code: "INTERNAL_ERROR" },
                { status: 500 }
            );
        }
    };
}
