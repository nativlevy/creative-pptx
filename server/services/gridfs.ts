import { GridFSBucket, ObjectId } from 'mongodb';
import { getDB } from '../db';
import { Readable } from 'stream';

let bucket: GridFSBucket | null = null;

export async function getGridFSBucket(): Promise<GridFSBucket> {
  if (bucket) return bucket;

  const db = await getDB();
  bucket = new GridFSBucket(db, { bucketName: 'uploads' });
  return bucket;
}

/**
 * Upload a file to GridFS
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  metadata: {
    mimeType: string;
    originalName: string;
    documentId?: ObjectId;
  }
): Promise<ObjectId> {
  const bucket = await getGridFSBucket();

  const readableStream = Readable.from(buffer);

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        ...metadata,
        uploadedAt: new Date()
      }
    });

    readableStream
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {
        resolve(uploadStream.id as ObjectId);
      });
  });
}

/**
 * Download a file from GridFS
 */
export async function downloadFile(fileId: ObjectId): Promise<{
  buffer: Buffer;
  filename: string;
  metadata: Record<string, unknown>;
}> {
  const bucket = await getGridFSBucket();
  const db = await getDB();

  // Get file info
  const files = await db.collection('uploads.files').findOne({ _id: fileId });
  if (!files) {
    throw new Error('File not found');
  }

  // Download file
  const chunks: Buffer[] = [];
  const downloadStream = bucket.openDownloadStream(fileId);

  return new Promise((resolve, reject) => {
    downloadStream
      .on('data', (chunk) => chunks.push(chunk))
      .on('error', reject)
      .on('end', () => {
        resolve({
          buffer: Buffer.concat(chunks),
          filename: files.filename,
          metadata: files.metadata || {}
        });
      });
  });
}

/**
 * Delete a file from GridFS
 */
export async function deleteFile(fileId: ObjectId): Promise<void> {
  const bucket = await getGridFSBucket();
  await bucket.delete(fileId);
}

/**
 * Get file info without downloading
 */
export async function getFileInfo(fileId: ObjectId): Promise<{
  filename: string;
  length: number;
  uploadDate: Date;
  metadata: Record<string, unknown>;
} | null> {
  const db = await getDB();
  const file = await db.collection('uploads.files').findOne({ _id: fileId });

  if (!file) return null;

  return {
    filename: file.filename,
    length: file.length,
    uploadDate: file.uploadDate,
    metadata: file.metadata || {}
  };
}
