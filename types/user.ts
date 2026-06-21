import { Status } from "./common"

export type BaseUser = {
    email: string | null;
    name?: string;
    picture?: string;
    provider: string | null;
    providerUserId: string | null;
}

export type User = BaseUser & {
    id: string;
    status: Status;
}