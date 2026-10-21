import { NextRequest, NextResponse } from 'next/server';
import { saveBufferToUploads, downloadImageToUploads } from '@/lib/imageDownloader';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';

    // Determine public base URL from request host (always HTTPS for production domains)
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:4036';
    const proto = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    const baseUrl = `${proto}://${host}`;

    // If uploading via multipart/form-data file
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const relativeUrl = saveBufferToUploads(buffer, file.name);
      const fullUrl = `${baseUrl}${relativeUrl}`;

      return NextResponse.json({ success: true, url: fullUrl, relativeUrl });
    }

    // If uploading via JSON with remote imageUrl to download
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { imageUrl } = body;

      if (!imageUrl) {
        return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
      }

      // If already a valid remote HTTPS image, return as is
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return NextResponse.json({ success: true, url: imageUrl });
      }

      const localPath = await downloadImageToUploads(imageUrl);
      const fullUrl = localPath.startsWith('http') ? localPath : `${baseUrl}${localPath}`;
      return NextResponse.json({ success: true, url: fullUrl });
    }

    return NextResponse.json({ error: 'Unsupported media type' }, { status: 415 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
