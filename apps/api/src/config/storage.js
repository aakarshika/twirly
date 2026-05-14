import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from './env.js';

function createLocalStorage() {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const bucket = req.query.bucket ?? 'misc';
      const dir = path.resolve(env.UPLOAD_DIR, bucket);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}-${safe}`);
    },
  });
}

async function createS3Storage() {
  const { S3Client } = await import('@aws-sdk/client-s3');
  const { default: multerS3 } = await import('multer-s3');
  const s3 = new S3Client({ region: env.AWS_REGION });
  return multerS3({
    s3,
    bucket: env.AWS_BUCKET,
    key: (req, file, cb) => {
      const bucket = req.query.bucket ?? 'misc';
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${bucket}/${Date.now()}-${safe}`);
    },
    acl: 'public-read',
  });
}

// In local mode, export immediately. In S3 mode, upload is set asynchronously
// before any route handler runs (app.js awaits initStorage).
let _multer = multer({ storage: createLocalStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export async function initStorage() {
  if (env.STORAGE_DRIVER === 's3') {
    const storage = await createS3Storage();
    _multer = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
  }
}

export const upload = {
  single: (field) => (req, res, next) => _multer.single(field)(req, res, next),
};
