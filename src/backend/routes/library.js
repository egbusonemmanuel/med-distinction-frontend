import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";

const router = express.Router();

// ====== SETUP ====== //
const __dirname = path.resolve();
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer for local media uploads
const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

// Multer for MongoDB docs (store buffer)
const memoryStorage = multer.memoryStorage();

const uploadMedia = multer({ storage: mediaStorage });
const uploadDocs = multer({ storage: memoryStorage });

// MongoDB GridFS
let gfsBucket;
mongoose.connection.once("open", () => {
  gfsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: "library" });
});

// ====== ROUTES ====== //

// Upload document (PDF/Word -> GridFS)
router.post("/upload/doc", uploadDocs.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const readable = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "library",
    }).openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });

    readable.end(req.file.buffer);

    readable.on("finish", (file) => {
      res.json({ message: "Document uploaded", file });
    });
  } catch (err) {
    console.error("Upload doc error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Upload media (Audio/Video -> local uploads)
router.post("/upload/media", uploadMedia.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({
    message: "Media uploaded",
    file: {
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      type: req.file.mimetype.startsWith("video") ? "video" : "audio",
    },
  });
});

// List all files
router.get("/", async (req, res) => {
  try {
    const docs = await gfsBucket.find().toArray();
    const documents = docs.map((file) => ({
      _id: file._id,
      filename: file.filename,
      type: "document",
      contentType: file.contentType,
    }));

    const mediaFiles = fs.readdirSync(uploadDir).map((file) => {
      const ext = path.extname(file).toLowerCase();
      const type = ext.match(/\.(mp4|mkv|avi|mov)$/) ? "video" : "audio";
      return {
        filename: file,
        type: "media",
        contentType: type,
        url: `/api/library/stream/${file}`,
      };
    });

    res.json([...documents, ...mediaFiles]);
  } catch (err) {
    console.error("List error:", err);
    res.status(500).json({ error: "Failed to fetch library" });
  }
});

// Download/View document from GridFS
router.get("/doc/:id", async (req, res) => {
  try {
    const file = await gfsBucket
      .find({ _id: new ObjectId(req.params.id) })
      .toArray();
    if (!file || file.length === 0) return res.status(404).json({ error: "File not found" });

    res.set("Content-Type", file[0].contentType);
    gfsBucket.openDownloadStream(new ObjectId(req.params.id)).pipe(res);
  } catch (err) {
    res.status(500).json({ error: "Error fetching document" });
  }
});

// Stream audio/video from local storage
router.get("/stream/:filename", (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": req.params.filename.endsWith(".mp4")
        ? "video/mp4"
        : "audio/mpeg",
    });

    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": req.params.filename.endsWith(".mp4")
        ? "video/mp4"
        : "audio/mpeg",
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

// Delete document (GridFS)
router.delete("/doc/:id", async (req, res) => {
  try {
    await gfsBucket.delete(new ObjectId(req.params.id));
    res.json({ message: "Document deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete document" });
  }
});

// Delete media file (local)
router.delete("/media/:filename", (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });

  fs.unlinkSync(filePath);
  res.json({ message: "Media deleted" });
});

export default router;
