/**
 * Typed application errors.
 *
 * Every error carries a machine-readable `code` and the HTTP `status` it
 * should map to at an API boundary, so callers can branch on `instanceof`
 * instead of matching on a message string.
 */
export class AppError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly status: number
    ) {
        super(message);
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class UnauthenticatedError extends AppError {
    constructor(message = "Unauthenticated") {
        super(message, "UNAUTHENTICATED", 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = "Forbidden Error") {
        super(message, "FORBIDDEN", 403);
    }
}

export class ResourceNotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, "RESOURCE_NOT_FOUND", 404);
    }
}

export class InvalidTokenError extends AppError {
    constructor(message = "Invalid ID token") {
        super(message, "INVALID_TOKEN", 401);
    }
}

export class BadRequestError extends AppError {
    constructor(message = "Bad Request", code = "BAD_REQUEST") {
        super(message, code, 400);
    }
}

/**
 * A precondition/invariant violated by the surrounding code itself
 * (e.g. a hook used outside its provider), not by request data.
 * There's no HTTP status to map it to, so it intentionally doesn't extend `AppError`.
 */
export class InvariantError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvariantError";
    }
}
