const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage — files go directly to your Cloudinary account.
// req.file.path  →  the full Cloudinary HTTPS URL (store this in the DB)
// req.file.filename  →  the Cloudinary public_id
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Store documents (PDF, Word, Excel) as 'raw'; images use default 'image'
    const docMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const isDoc = docMimes.includes(file.mimetype);

    // Build a safe, human-readable public_id that preserves the original filename
    const ext = path.extname(file.originalname); // e.g. ".pdf"
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_') // strip spaces/special chars
      .slice(0, 80); // keep it reasonably short
    const uniqueSuffix = Date.now(); // avoid overwriting files with the same name

    return {
      folder: 'bes-uploads',
      resource_type: isDoc ? 'raw' : 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xlsx', 'xls'],
      // 'raw' files (PDF/Word/Excel) need the extension baked into public_id,
      // since Cloudinary does NOT auto-append it for raw resource types.
      // Images get their format handled automatically, so we omit ext there.
      public_id: `${baseName}_${uniqueSuffix}${isDoc ? ext : ''}`,
      // Automatically transform images on upload for web optimisation
      ...(isDoc ? {} : { transformation: [{ quality: 'auto', fetch_format: 'auto' }] }),
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xlsx|xls/;
  const extOk = allowed.test(file.originalname.split('.').pop().toLowerCase());
  const mimeOk =
    allowed.test(file.mimetype) ||
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.mimetype === 'application/msword' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'application/vnd.ms-excel';

  if (extOk || mimeOk) cb(null, true);
  else cb(new Error('Only images, PDFs, and Office documents are allowed.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

module.exports = upload;