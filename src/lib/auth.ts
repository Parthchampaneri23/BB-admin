import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'businessbullet_secret_super_key_2026_jwt_token';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function getAuthUser(request: NextRequest): TokenPayload | null {
  const token = request.cookies.get('bb_admin_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
