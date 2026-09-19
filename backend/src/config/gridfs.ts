import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

let gridFSBucket: GridFSBucket | null = null;

export function getGridFSBucket(): GridFSBucket {
  if (!gridFSBucket) {
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established for GridFS');
    }
    gridFSBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'voiceRecordings'
    });
  }
  return gridFSBucket;
}

export function uploadAudioToGridFS(fileBuffer: Buffer, filename: string, contentType: string): Promise<ObjectId> {
  return new Promise((resolve, reject) => {
    const bucket = getGridFSBucket();
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: contentType || 'audio/webm'
    });

    const readableStream = new Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null);

    uploadStream.on('error', (err) => reject(err));
    uploadStream.on('finish', () => resolve(uploadStream.id));

    readableStream.pipe(uploadStream);
  });
}

export function getAudioStreamFromGridFS(fileId: ObjectId) {
  const bucket = getGridFSBucket();
  return bucket.openDownloadStream(fileId);
}
