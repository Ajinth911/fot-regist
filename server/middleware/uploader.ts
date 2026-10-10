import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const rawExt = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Sanitize fieldname to alphanumeric only
    const cleanFieldName = file.fieldname.replace(/[^a-zA-Z0-9_-]/g, '');
    cb(null, `${cleanFieldName}-${uniqueSuffix}${safeExt}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      cb(new Error('Invalid file extension. Only .jpg, .jpeg, .png, and .webp files are permitted.'));
      return;
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error('Invalid file content type. Only JPEG, PNG, and WebP images are allowed.'));
      return;
    }
    cb(null, true);
  },
});
