import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function downloadImageToUploads(imageUrl: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // If already a local upload, return as is
  if (imageUrl.startsWith('/uploads/')) {
    return imageUrl;
  }

  // If it's a relative path from the main website (e.g., /images/news/markets_xyz.jpg)
  if (imageUrl.startsWith('/images/')) {
    const sourceFilePath = path.join(process.cwd(), '..', 'BB-website', 'public', imageUrl);
    if (fs.existsSync(sourceFilePath)) {
      const ext = path.extname(imageUrl) || '.jpg';
      const filename = `bb_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
      const destPath = path.join(uploadsDir, filename);
      fs.copyFileSync(sourceFilePath, destPath);
      return `/uploads/${filename}`;
    }
  }

  // If it's an HTTP/HTTPS remote URL
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    try {
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      let ext = '.jpg';
      if (contentType.includes('png')) ext = '.png';
      else if (contentType.includes('webp')) ext = '.webp';
      else if (contentType.includes('gif')) ext = '.gif';
      else if (contentType.includes('svg')) ext = '.svg';
      else {
        const urlExt = path.extname(new URL(imageUrl).pathname);
        if (urlExt && urlExt.length <= 5) ext = urlExt;
      }

      const filename = `downloaded_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
      const destPath = path.join(uploadsDir, filename);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(destPath, buffer);

      return `/uploads/${filename}`;
    } catch (err) {
      console.error('Error downloading image from URL:', err);
      // Fallback: if download fails, return the original or throw
      throw new Error(`Could not download image from ${imageUrl}: ${(err as Error).message}`);
    }
  }

  return imageUrl;
}

export function saveBufferToUploads(buffer: Buffer, originalFilename: string): string {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = path.extname(originalFilename) || '.jpg';
  const filename = `upload_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
  const destPath = path.join(uploadsDir, filename);
  fs.writeFileSync(destPath, buffer);
  return `/uploads/${filename}`;
}
