// migrateToCloudinary.js
import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import cloudinary from "./cloudinary.js"; // Make sure your cloudinary config uses `export default cloudinary;`

// ----------------------
// MONGODB SETUP
// ----------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const FileSchema = new mongoose.Schema({
  filename: String,
  customName: String,
  mimetype: String,
  size: Number,
  tags: [String],
  downloads: Number,
  url: String,
  createdAt: Date,
});

const File = mongoose.model("File", FileSchema);

// ----------------------
// MIGRATION
// ----------------------
const UPLOADS_DIR = path.join(process.cwd(), "uploads"); // your local uploads folder

async function migrateFiles() {
  try {
    const files = fs.readdirSync(UPLOADS_DIR);

    for (let file of files) {
      const filePath = path.join(UPLOADS_DIR, file);

      try {
        const result = await cloudinary.uploader.upload(filePath, {
          resource_type: "auto",
          folder: "myAppFiles", // optional folder in Cloudinary
        });

        console.log(`Uploaded: ${file} -> ${result.secure_url}`);

        // Update DB: find file by filename and update url
        await File.updateOne(
          { filename: file },
          { $set: { url: result.secure_url } }
        );

      } catch (err) {
        console.error(`Error uploading ${file}:`, err.message);
      }
    }

    console.log("Migration complete!");
    mongoose.disconnect();
  } catch (err) {
    console.error("Error reading uploads folder:", err);
  }
}

migrateFiles();
