import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getAdminClient } from '@/lib/server-auth';

const BUCKET_NAME = 'ebs-media';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * POST /api/upload
 * Secure authenticated image upload endpoint
 * Accepts multipart/form-data with `file` and optional `folder`
 */
export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const { user, error: authErr } = await getAuthenticatedUser(request);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required to upload media' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files (PNG, JPG, WEBP, GIF) are supported' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const admin = getAdminClient();

    // 2. Ensure bucket exists
    const { data: buckets } = await admin.storage.listBuckets();
    const bucketExists = (buckets || []).some(b => b.name === BUCKET_NAME || b.id === BUCKET_NAME);
    if (!bucketExists) {
      await admin.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
      });
    }

    // 3. Format safe path
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${folder}/${user.id}/${Date.now()}_${cleanFileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    // 4. Upload to storage
    const { error: uploadErr } = await admin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadErr) {
      return NextResponse.json({ error: `Upload failed: ${uploadErr.message}` }, { status: 500 });
    }

    // 5. Get public URL
    const { data: { publicUrl } } = admin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      filePath,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload processing error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
