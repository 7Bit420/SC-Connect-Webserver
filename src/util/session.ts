export interface session {
    expiresAt: number;
    createdAt: number;
    sudo: boolean;
    user: string;
    id: string;
}
