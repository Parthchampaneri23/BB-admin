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

    // If uploading via multipart/form-data file
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const localUrl = saveBufferToUploads(buffer, file.name);

      return NextResponse.json({ success: true, url: localUrl });
    }

    // If uploading via JSON with remote imageUrl to download
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { imageUrl } = body;

      if (!imageUrl) {
        return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
      }

      const localUrl = await downloadImageToUploads(imageUrl);
      return NextResponse.json({ success: true, url: localUrl });
    }

    return NextResponse.json({ error: 'Unsupported media type' }, { status: 415 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
