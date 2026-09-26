import { NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

export async function validateBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.') || 'general';
        fieldErrors[path] = err.message;
      });
      return {
        success: false,
        response: NextResponse.json(
          { error: { message: 'Validation failed', fields: fieldErrors } },
          { status: 400 }
        ),
      };
    }
    return {
      success: false,
      response: NextResponse.json(
        { error: { message: 'Invalid or missing JSON request body' } },
        { status: 400 }
      ),
    };
  }
}
