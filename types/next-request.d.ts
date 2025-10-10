import { NextRequest as OriginalNextRequest } from 'next/server'

declare global {
    declare interface AuthRequest extends OriginalNextRequest {
        user: TokenUser
    }
}

interface TokenUser {
    role: string;
        userId: number;
        phone: string;
}