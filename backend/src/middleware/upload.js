import multer from "multer";
import { badRequest } from "../utils/http.js";

const MAX_BYTES = 15 * 1024 * 1024;
const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter(_req, file, done) {
    if (allowed.has(file.mimetype)) done(null, true);
    else done(badRequest("Photos must be JPEG, PNG, WebP or AVIF", "bad_photo"));
  },
});

/**
 * Reads a form that may carry one photo in its `photo` field. The photo ends
 * up in `req.file` (in memory, not yet saved) and the other fields in `req.body`.
 */
export function photoUpload(req, res, next) {
  upload.single("photo")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const tooLarge = err.code === "LIMIT_FILE_SIZE";
      return next(
        badRequest(
          tooLarge ? "The photo is too large (max 15 MB)" : "Upload failed",
          tooLarge ? "photo_too_large" : undefined
        )
      );
    }
    next(err);
  });
}
