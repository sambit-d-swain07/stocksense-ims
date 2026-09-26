import { NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from './jwt';

export async function requireAuth(req: Request): Promise<
  | { user: TokenPayload; errorResponse: null }
  | { user: null; errorResponse: NextResponse }
> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: { message: 'Missing or invalid Authorization header' } },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: { message: 'Invalid or expired authentication token' } },
        { status: 401 }
      ),
    };
  }

  return { user: payload, errorResponse: null };
}
