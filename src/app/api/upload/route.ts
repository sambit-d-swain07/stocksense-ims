import { NextResponse } from 'next/server';

/**
 * Reusable File Upload API Route Stub
 * Supports multipart/form-data requests for tomorrow's potential file requirements.
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: { message: 'No file provided in request' } },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Placeholder: Process or write file to disk / S3 / cloud storage
    console.log(`[Upload Stub] Received file: ${file.name}, size: ${buffer.length} bytes, type: ${file.type}`);

    return NextResponse.json({
      data: {
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        url: `/uploads/${file.name}`, // Example URL
      },
    });
  } catch (err: any) {
    console.error('File upload error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'File upload failed' } },
      { status: 500 }
    );
  }
}
