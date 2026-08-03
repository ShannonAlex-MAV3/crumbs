import { SessionPayload, UserDetails, VerifiedGooglePayload } from "@/types/user";
import { getSession } from "../auth/session";
import { ForbiddenError, ResourceNotFoundError, UnauthenticatedError } from "../error/errors";
import { Provider, Status } from "../generated/prisma/enums";
import db from "../prisma";

export async function getCurrentUser(session?: SessionPayload): Promise<UserDetails> {
    const { userId } = session ?? await getSession();
    const user = await getUserById(userId);
    if (user.status == Status.INA) throw new ForbiddenError("Inactivated User");
    return user;
}

export async function getUserById(id?: string): Promise<UserDetails & { status: Status; }> {
    if (!id) throw new UnauthenticatedError();

    const user = await db.user.findFirst({
        where: {
            id: id,
        },
        select: { email: true, name: true, picture: true, status: true },
    });

    if (!user) throw new ResourceNotFoundError();

    return {
        ...user,
        name: user.name ?? undefined,
        picture: user.picture ?? undefined,
        status: user.status
    };
}

export async function upsertUser(payload: VerifiedGooglePayload) {
    return await db.user.upsert({
        where: {
            provider_providerUserId: {
                provider: Provider.GOOGLE,
                providerUserId: payload.sub,
            },
        },
        update: {
            name: payload.name,
            picture: payload.picture,
        },
        create: {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            provider: Provider.GOOGLE,
            providerUserId: payload.sub,
        },
    });
}