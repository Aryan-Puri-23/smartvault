import express from "express";
import multer from "multer";
import File from "../models/File.js";
import Log from "../models/Log.js";
import cloudinary from "../cloudinary.js";

const router = express.Router();

// ----------------- MULTER MEMORY STORAGE -----------------
const storage = multer.memoryStorage(); // store files in memory
const upload = multer({ storage });

// ----------------- UPLOAD FILE -----------------
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { description, tags, userId, customName, folderId } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });
    if (!req.file) {
  return res.status(400).json({ error: "No file uploaded" });
}

    const newFile = new File({
      userId,
      folderId: folderId || null,
      originalname: req.file.originalname,
      customName: customName || req.file.originalname,
      description,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // 🌩️ Upload to Cloudinary from buffer
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `smartvault/${userId}` },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(buffer);
      });
    };

    const cloudResult = await streamUpload(req.file.buffer);

    if (cloudResult && cloudResult.secure_url) {
      newFile.cloudinaryUrl = cloudResult.secure_url;
      newFile.cloudinaryId = cloudResult.public_id;
    }

    await newFile.save();

    await Log.create({
      userId,
      action: "ADD",
      fileId: newFile._id,
      fileName: newFile.customName || newFile.originalname,
    });

    // res.json({ message: "File uploaded successfully", file: newFile });
    res.json({ message: "File uploaded successfully", file: newFile.toObject({ virtuals: true }) });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- FETCH FILES -----------------
router.get("/", async (req, res) => {
  try {
    const { userId, folderId } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    let query = { userId };
    if (folderId) query.folderId = folderId;

    // const files = await File.find(query).sort({ createdAt: -1 });
    // res.json(files);
    const files = await File.find(query).sort({ createdAt: -1 }).lean({ virtuals: true });
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- DOWNLOAD FILE -----------------
router.get("/:id/download", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    // Increment downloads
    file.downloads = (file.downloads || 0) + 1;
    await file.save();

    // Log download
    await Log.create({
      userId: file.userId,
      action: "DOWNLOAD",
      fileId: file._id,
      fileName: file.customName || file.originalname,
    });

    if (file.cloudinaryUrl) {
      return res.redirect(file.cloudinaryUrl);
    } else {
      return res.status(404).json({ error: "File not available" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- DELETE FILE -----------------
router.delete("/:id", async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    // 🌩️ Delete from Cloudinary
    if (file.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(file.cloudinaryId);
      } catch (err) {
        console.error("Failed to delete from Cloudinary:", err);
      }
    }

    await Log.create({
      userId: file.userId,
      action: "DELETE",
      fileId: file._id,
      fileName: file.customName || file.originalname,
    });

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- EDIT FILE METADATA -----------------
router.patch("/:id", async (req, res) => {
  try {
    const updates = req.body;
    const file = await File.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!file) return res.status(404).json({ error: "File not found" });

    await Log.create({
      userId: file.userId,
      action: "EDIT",
      fileId: file._id,
      fileName: file.customName || file.originalname,
    });

    res.json(file);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- GET USER LOGS -----------------
router.get("/logs/user/:userId", async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(20);
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;




// import express from "express";
// import multer from "multer";
// import File from "../models/File.js";
// import path from "path";
// import fs from "fs";
// import Log from "../models/Log.js";
// import cloudinary from "../cloudinary.js";


// const router = express.Router();

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // Configure multer to store files locally in /uploads
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, "uploads/"); // store files in 'uploads' folder
// //   },
// //   filename: (req, file, cb) => {
// //     cb(null, Date.now() + "-" + file.originalname); // unique filename
// //   },
// // });

// // const upload = multer({ storage });


// router.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     const { description, tags, userId, customName, folderId } = req.body;
//     if (!userId) return res.status(400).json({ error: "Missing userId" });

//     const newFile = new File({
//       userId,
//       folderId: folderId || null,
//       // filename: req.file.filename,
//       originalname: req.file.originalname,
//       customName: customName || req.file.originalname,
//       description,
//       tags: tags ? tags.split(",").map((t) => t.trim()) : [],
//       mimetype: req.file.mimetype,
//       size: req.file.size,
//       // path: `/uploads/${req.file.filename}`, // local path
//     });

//     // 🌩️ Upload to Cloudinary (non-blocking for local)
//     const cloudResult = await cloudinary.uploader.upload(req.file.path, {
//       folder: `smartvault/${userId}`,
//     });

//     if (cloudResult && cloudResult.secure_url) {
//       newFile.cloudinaryUrl = cloudResult.secure_url;
//       newFile.cloudinaryId = cloudResult.public_id;
//     }

//     await newFile.save();

//     await Log.create({
//       userId,
//       action: "ADD",
//       fileId: newFile._id,
//       fileName: newFile.customName || newFile.originalname,
//     });

//     res.json({ message: "File uploaded successfully", file: newFile });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });



// // @route POST /api/files/upload
// // router.post("/upload", upload.single("file"), async (req, res) => {
// //   try {
// //     const { description, tags, userId, customName, folderId } = req.body;
// //     if (!userId) return res.status(400).json({ error: "Missing userId" });

// //     const newFile = new File({
// //       userId,
// //       folderId: folderId || null,
// //       filename: req.file.filename,
// //       originalname: req.file.originalname,
// //       customName: customName || req.file.originalname,
// //       description,
// //       tags: tags ? tags.split(",").map((t) => t.trim()) : [],
// //       mimetype: req.file.mimetype,
// //       size: req.file.size,
// //       path: `/uploads/${req.file.filename}`, // local path
// //     });

// //     await newFile.save();

// //     await Log.create({
// //       userId,
// //       action: "ADD",
// //       fileId: newFile._id,
// //       fileName: newFile.customName || newFile.originalname,
// //     });

// //     res.json({ message: "File uploaded successfully", file: newFile });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });

// // @route GET /api/files
// router.get("/", async (req, res) => {
//   try {
//     const { userId, folderId } = req.query;
//     if (!userId) return res.status(400).json({ error: "Missing userId" });

//     let query = { userId };
//     if (folderId) query.folderId = folderId;

//     const files = await File.find(query).sort({ createdAt: -1 });
//     res.json(files);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // @route GET /api/files/:id/download
// router.get("/:id/download", async (req, res) => {
//   try {
//     const file = await File.findById(req.params.id);
//     if (!file) return res.status(404).json({ error: "File not found" });

//     // Increment downloads
//     file.downloads = (file.downloads || 0) + 1;
//     await file.save();

//     // Log download
//     await Log.create({
//       userId: file.userId,
//       action: "DOWNLOAD",
//       fileId: file._id,
//       fileName: file.customName || file.originalname,
//     });

//     const filePath = path.resolve("uploads", file.filename);
//     res.download(filePath, file.originalname);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // @route DELETE /api/files/:id
// router.delete("/:id", async (req, res) => {
//   try {
//     const file = await File.findByIdAndDelete(req.params.id);
//     if (!file) return res.status(404).json({ error: "File not found" });

//     // 🌩️ Delete from Cloudinary if it exists
// if (file.cloudinaryId) {
//   try {
//     await cloudinary.uploader.destroy(file.cloudinaryId);
//   } catch (err) {
//     console.error("Failed to delete from Cloudinary:", err);
//   }
// }


//     await Log.create({
//       userId: file.userId,
//       action: "DELETE",
//       fileId: file._id,
//       fileName: file.customName || file.originalname,
//     });

//     const filePath = path.resolve("uploads", file.filename);
//     fs.unlink(filePath, (err) => {
//       if (err) console.error("Failed to delete file from disk:", err);
//     });

//     res.json({ message: "File deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // @route PATCH /api/files/:id
// router.patch("/:id", async (req, res) => {
//   try {
//     const updates = req.body; 
//     const file = await File.findByIdAndUpdate(req.params.id, updates, { new: true });
//     if (!file) return res.status(404).json({ error: "File not found" });

//     await Log.create({
//       userId: file.userId,
//       action: "EDIT",
//       fileId: file._id,
//       fileName: file.customName || file.originalname,
//     });

//     res.json(file);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // GET logs for user
// router.get("/logs/user/:userId", async (req, res) => {
//   try {
//     const logs = await Log.find({ userId: req.params.userId })
//       .sort({ timestamp: -1 })
//       .limit(20);
//     res.json(logs);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// export default router;



// import express from "express";
// import multer from "multer";
// import File from "../models/File.js";
// import path from "path";
// import fs from "fs";
// import Log from "../models/Log.js";
// import { bucket } from "../firebase.js";


// const storage = multer.memoryStorage();
// const upload = multer({ storage });


// const router = express.Router();

// // Configure multer (store files locally in /uploads)
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, "uploads/");
// //   },
// //   filename: (req, file, cb) => {
// //     cb(null, Date.now() + "-" + file.originalname);
// //   },
// // });

// // const upload = multer({ storage });


// // @route POST /api/files/upload
// router.post("/upload", upload.single("file"), async (req, res) => {
//     console.log("Request body:", req.body);
// console.log("File info:", req.file);
// console.log("Bucket exists:", !!bucket);

//   try {
//     const { description, tags, userId, customName, folderId } = req.body;
//     if (!userId) return res.status(400).json({ error: "Missing userId" });
//     if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//     // 🔹 Upload file to Firebase Storage
//     const firebaseFileName = Date.now() + "-" + req.file.originalname;
//     const firebaseFile = bucket.file(firebaseFileName);
//     await firebaseFile.save(req.file.buffer, {
//       metadata: { contentType: req.file.mimetype },
//       resumable: false,
//     });

//     // 🔹 Get Firebase URL
//     const [url] = await firebaseFile.getSignedUrl({
//       action: "read",
//       expires: "03-01-2500",
//     });

//     // 🔹 Save file metadata to MongoDB
//     const newFile = new File({
//       userId,
//       folderId: folderId || null,
//       filename: req.file.originalname,
//       firebaseName: firebaseFileName,
//       customName: customName || req.file.originalname,
//       description,
//       tags: tags ? tags.split(",").map((t) => t.trim()) : [],
//       mimetype: req.file.mimetype,
//       size: req.file.size,
//       path: url,   // use Firebase URL
//       url,         // store signed URL as well
//     });

//     await newFile.save();

//     // 🔹 Log action
//     await Log.create({
//       userId,
//       action: "ADD",
//       fileId: newFile._id,
//       fileName: newFile.customName || newFile.filename,
//     });

//     res.json({ message: "File uploaded successfully", file: newFile });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });



// // router.post("/upload", upload.single("file"), async (req, res) => {
// //   try {
// //     const { description, tags, userId, customName, folderId } = req.body;
// //     if (!userId) return res.status(400).json({ error: "Missing userId" });
// //     if (!req.file) return res.status(400).json({ error: "No file uploaded" });

// //     // 🔹 This is where your Firebase upload code goes
// //     const firebaseFileName = Date.now() + "-" + req.file.originalname;
// //     const firebaseFile = bucket.file(firebaseFileName);
// //     await firebaseFile.save(req.file.buffer, {
// //       metadata: { contentType: req.file.mimetype },
// //       resumable: false,
// //     });

// //     const [url] = await firebaseFile.getSignedUrl({
// //       action: "read",
// //       expires: "03-01-2500",
// //     });

// //     // 🔹 Save file info in MongoDB
// //     const newFile = new File({
// //       userId,
// //       folderId: folderId || null,
// //       filename: req.file.originalname,
// //       firebaseName: firebaseFileName,   // store the actual Firebase filename
// //       customName: customName || req.file.originalname,
// //       description,
// //       tags: tags ? tags.split(",").map((t) => t.trim()) : [],
// //       mimetype: req.file.mimetype,
// //       size: req.file.size,
// //     //   path: url,
// //       url: url
// //     });

// //     await newFile.save();

// //     await Log.create({
// //       userId,
// //       action: "ADD",
// //       fileId: newFile._id,
// //       fileName: newFile.customName || newFile.filename,
// //     });

// //     res.json({ message: "File uploaded successfully", file: newFile });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });



// // @route POST /api/files/upload
// // router.post("/upload", upload.single("file"), async (req, res) => {
// //   try {
// //     const { description, tags, userId, customName, folderId } = req.body;
// //     if (!userId) return res.status(400).json({ error: "Missing userId" });

// //     if (!req.file) return res.status(400).json({ error: "No file uploaded" });

// //     // Upload to Firebase
// //     const firebaseFile = bucket.file(Date.now() + "-" + req.file.originalname);
// //     await firebaseFile.save(req.file.buffer, {
// //       metadata: { contentType: req.file.mimetype },
// //       resumable: false,
// //     });

// //     // Get public URL
// //     const [url] = await firebaseFile.getSignedUrl({
// //       action: "read",
// //       expires: "03-01-2500", // long expiry
// //     });

// //     const newFile = new File({
// //       userId,
// //       folderId: folderId || null,
// //       filename: req.file.originalname,
// //       customName: customName || req.file.originalname,
// //       description,
// //       tags: tags ? tags.split(",").map((t) => t.trim()) : [],
// //       mimetype: req.file.mimetype,
// //       size: req.file.size,
// //       path: url, // store Firebase URL instead of local path
// //     });

// //     await newFile.save();
// //     await Log.create({
// //       userId,
// //       action: "ADD",
// //       fileId: newFile._id,
// //       fileName: newFile.customName || newFile.filename,
// //     });

// //     res.json({ message: "File uploaded successfully", file: newFile });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });


// // router.post("/upload", upload.single("file"), async (req, res) => {
// //   try {
// //     const { description, tags, userId, customName, folderId } = req.body; // 👈 added folderId
// //     if (!userId) return res.status(400).json({ error: "Missing userId" });

// //     const newFile = new File({
// //       userId,
// //       folderId: folderId || null, // 👈 save folder reference (null if not inside folder)
// //       filename: req.file.filename,
// //       originalname: req.file.originalname,
// //       customName: customName || req.file.originalname,
// //       description,
// //       tags: tags ? tags.split(",").map((t) => t.trim()) : [],
// //       mimetype: req.file.mimetype,
// //       size: req.file.size,
// //       path: `/uploads/${req.file.filename}`,
// //     });

// //     await newFile.save();
// //     await Log.create({
// //   userId,
// //   action: "ADD",
// //   fileId: newFile._id,
// //   fileName: newFile.customName || newFile.originalname,
// // });

// //     res.json({ message: "File uploaded successfully", file: newFile });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });


// // @route GET /api/files
// router.get("/", async (req, res) => {
//   try {
//     const { userId, folderId } = req.query;
//     if (!userId) return res.status(400).json({ error: "Missing userId" });

//     let query = { userId };
//     if (folderId) query.folderId = folderId; // 👈 filter files by folder

//     const files = await File.find(query).sort({ createdAt: -1 });
//     res.json(files);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });



// // @route GET /api/files/:id/download
// router.get("/:id/download", async (req, res) => {
//   try {
//     const file = await File.findById(req.params.id);
//     if (!file) return res.status(404).json({ error: "File not found" });

//     // Increment downloads
//     file.downloads = (file.downloads || 0) + 1;
//     await file.save();

//     // Log download
//     await Log.create({
//       userId: file.userId,
//       action: "DOWNLOAD",
//       fileId: file._id,
//       fileName: file.customName || file.filename,
//     });

//     // Return Firebase URL
//     res.json({ url: file.path });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });



// // router.get("/:id/download", async (req, res) => {
// //   try {
// //     const file = await File.findById(req.params.id);
// //     if (!file) return res.status(404).json({ error: "File not found" });

// //     file.downloads = (file.downloads || 0) + 1;
// //     await file.save();

// //     await Log.create({
// //       userId: file.userId,
// //       action: "DOWNLOAD",
// //       fileId: file._id,
// //       fileName: file.customName || file.filename,
// //     });

// //     res.json({ url: file.path }); // return Firebase URL
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });



// // router.get("/:id/download", async (req, res) => {
// //   try {
// //     const file = await File.findById(req.params.id);
// //     if (!file) return res.status(404).json({ error: "File not found" });

// //     // 👇 increment downloads
// //     file.downloads = (file.downloads || 0) + 1;
// //     await file.save();

// //     // 👇 log the download action
// //     await Log.create({
// //       userId: file.userId,
// //       action: "DOWNLOAD", // new action for downloads
// //       fileId: file._id,
// //       fileName: file.customName || file.originalname,
// //     });

// //     const filePath = path.resolve("uploads", file.filename);
// //     res.download(filePath, file.originalname);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });



// // @route GET /api/files/:id/download
// // router.get("/:id/download", async (req, res) => {
// //   try {
// //     const file = await File.findById(req.params.id);
// //     if (!file) return res.status(404).json({ error: "File not found" });

// //     // 👇 increment downloads
// //     file.downloads = (file.downloads || 0) + 1;
// //     await file.save();

// //     const filePath = path.resolve("uploads", file.filename);
// //     res.download(filePath, file.originalname);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });


// // @route DELETE /api/files/:id
// router.delete("/:id", async (req, res) => {
//   try {
//     const file = await File.findById(req.params.id);
//     if (!file) return res.status(404).json({ error: "File not found" });

//     // Log delete action
//     await Log.create({
//       userId: file.userId,
//       action: "DELETE",
//       fileId: file._id,
//       fileName: file.customName || file.filename,
//     });

//     // Delete from Firebase
//     if (file.firebaseName) {
//       await bucket.file(file.firebaseName).delete();
//     }

//     // Delete from MongoDB
//     await File.findByIdAndDelete(req.params.id);

//     res.json({ message: "File deleted successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });





// // router.delete("/:id", async (req, res) => {
// //   try {
// //     // 1️⃣ Find the file first
// //     const file = await File.findById(req.params.id);
// //     if (!file) return res.status(404).json({ error: "File not found" });

// //     // 2️⃣ Create log BEFORE deleting
// //     await Log.create({
// //       userId: file.userId,
// //       action: "DELETE",
// //       fileId: file._id,
// //       fileName: file.customName || file.originalname,
// //     });

// //     // 3️⃣ Delete the file from DB
// //     await File.findByIdAndDelete(req.params.id);

// //     // 4️⃣ Delete the file from Firebase
// //     // Assuming you used `Date.now() + "-" + originalname` as filename in Firebase
// //     // await bucket.file(file.filename).delete();

// //     if (file.firebaseName) {
// //   await bucket.file(file.firebaseName).delete();
// // }

// //     res.json({ message: "File deleted successfully" });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });



// // router.delete("/:id", async (req, res) => {
// //   try {
// //     // 1️⃣ Find the file first (do NOT delete yet)
// //     const file = await File.findById(req.params.id);
// //     if (!file) return res.status(404).json({ error: "File not found" });

// //     // 2️⃣ Create log BEFORE deleting
// //     await Log.create({
// //       userId: file.userId,
// //       action: "DELETE",
// //       fileId: file._id,
// //       fileName: file.customName || file.originalname,
// //     });

// //     // 3️⃣ Delete the file from DB
// //     await File.findByIdAndDelete(req.params.id);

// //     // 4️⃣ Delete the file from disk
// //     const filePath = path.resolve("uploads", file.filename);
// //     fs.unlink(filePath, (err) => {
// //       if (err) console.error("Failed to delete file from disk:", err);
// //     });

// //     res.json({ message: "File deleted successfully" });
// //   } catch (err) {
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });


// // final final final boss

// // import express from "express";
// // import multer from "multer";
// // import File from "../models/File.js";
// // import path from "path";
// // import fs from "fs";
// // import Log from "../models/Log.js";


// // const router = express.Router();

// // // Configure multer (store files locally in /uploads)
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, "uploads/");
// //   },
// //   filename: (req, file, cb) => {
// //     cb(null, Date.now() + "-" + file.originalname);
// //   },
// // });

// // const upload = multer({ storage });


// // // @route POST /api/files/upload
// // router.post("/upload", upload.single("file"), async (req, res) => {
// //   try {
// //     const { description, tags, userId, customName, folderId } = req.body; // 👈 added folderId
// //     if (!userId) return res.status(400).json({ error: "Missing userId" });

// //     const newFile = new File({
// //       userId,
// //       folderId: folderId || null, // 👈 save folder reference (null if not inside folder)
// //       filename: req.file.filename,
// //       originalname: req.file.originalname,
// //       customName: customName || req.file.originalname,
// //       description,
// //       tags: tags ? tags.split(",").map((t) => t.trim()) : [],
// //       mimetype: req.file.mimetype,
// //       size: req.file.size,
// //       path: `/uploads/${req.file.filename}`,
// //     });

// //     await newFile.save();
// //     await Log.create({
// //   userId,
// //   action: "ADD",
// //   fileId: newFile._id,
// //   fileName: newFile.customName || newFile.originalname,
// // });

// //     res.json({ message: "File uploaded successfully", file: newFile });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });


// // // @route GET /api/files
// // router.get("/", async (req, res) => {
// //   try {
// //     const { userId, folderId } = req.query;
// //     if (!userId) return res.status(400).json({ error: "Missing userId" });

// //     let query = { userId };
// //     if (folderId) query.folderId = folderId; // 👈 filter files by folder

// //     const files = await File.find(query).sort({ createdAt: -1 });
// //     res.json(files);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });



// // // @route GET /api/files/:id/download
// // router.get("/:id/download", async (req, res) => {
// //   try {
// //     const file = await File.findById(req.params.id);
// //     if (!file) return res.status(404).json({ error: "File not found" });

// //     // 👇 increment downloads
// //     file.downloads = (file.downloads || 0) + 1;
// //     await file.save();

// //     // 👇 log the download action
// //     await Log.create({
// //       userId: file.userId,
// //       action: "DOWNLOAD", // new action for downloads
// //       fileId: file._id,
// //       fileName: file.customName || file.originalname,
// //     });

// //     const filePath = path.resolve("uploads", file.filename);
// //     res.download(filePath, file.originalname);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });



// // // @route GET /api/files/:id/download
// // // router.get("/:id/download", async (req, res) => {
// // //   try {
// // //     const file = await File.findById(req.params.id);
// // //     if (!file) return res.status(404).json({ error: "File not found" });

// // //     // 👇 increment downloads
// // //     file.downloads = (file.downloads || 0) + 1;
// // //     await file.save();

// // //     const filePath = path.resolve("uploads", file.filename);
// // //     res.download(filePath, file.originalname);
// // //   } catch (err) {
// // //     console.error(err);
// // //     res.status(500).json({ error: "Server error" });
// // //   }
// // // });


// // // @route DELETE /api/files/:id
// // router.delete("/:id", async (req, res) => {
// //   try {
// //     // 1️⃣ Find the file first (do NOT delete yet)
// //     const file = await File.findById(req.params.id);
// //     if (!file) return res.status(404).json({ error: "File not found" });

// //     // 2️⃣ Create log BEFORE deleting
// //     await Log.create({
// //       userId: file.userId,
// //       action: "DELETE",
// //       fileId: file._id,
// //       fileName: file.customName || file.originalname,
// //     });

// //     // 3️⃣ Delete the file from DB
// //     await File.findByIdAndDelete(req.params.id);

// //     // 4️⃣ Delete the file from disk
// //     const filePath = path.resolve("uploads", file.filename);
// //     fs.unlink(filePath, (err) => {
// //       if (err) console.error("Failed to delete file from disk:", err);
// //     });

// //     res.json({ message: "File deleted successfully" });
// //   } catch (err) {
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });





// // bestest

// // import express from "express";
// // import multer from "multer";
// // import File from "../models/File.js";
// // import path from "path";
// // import fs from "fs";
// // import Log from "../models/Log.js";


// // const router = express.Router();

// // // Configure multer (store files locally in /uploads)
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, "uploads/");
// //   },
// //   filename: (req, file, cb) => {
// //     cb(null, Date.now() + "-" + file.originalname);
// //   },
// // });

// // const upload = multer({ storage });

// // // @route POST /api/files/upload
// // // router.post("/upload", upload.single("file"), async (req, res) => {
// // //   try {
// // //     const { description, tags, userId, customName } = req.body;
// // //     if (!userId) return res.status(400).json({ error: "Missing userId" });

// // //     const newFile = new File({
// // //       userId,
// // //       filename: req.file.filename,
// // //       originalname: req.file.originalname,
// // //       customName: customName || req.file.originalname, // ✅ store custom name
// // //       description,
// // //       tags: tags ? tags.split(",").map((t) => t.trim()) : [],
// // //       mimetype: req.file.mimetype,
// // //       size: req.file.size,
// // //       path: `/uploads/${req.file.filename}`,
// // //     });

// // //     await newFile.save();
// // //     res.json({ message: "File uploaded successfully", file: newFile });
// // //   } catch (err) {
// // //     console.error(err);
// // //     res.status(500).json({ error: "Server error" });
// // //   }
// // // });


// // // @route POST /api/files/upload
// // router.post("/upload", upload.single("file"), async (req, res) => {
// //   try {
// //     const { description, tags, userId, customName, folderId } = req.body; // 👈 added folderId
// //     if (!userId) return res.status(400).json({ error: "Missing userId" });

// //     const newFile = new File({
// //       userId,
// //       folderId: folderId || null, // 👈 save folder reference (null if not inside folder)
// //       filename: req.file.filename,
// //       originalname: req.file.originalname,
// //       customName: customName || req.file.originalname,
// //       description,
// //       tags: tags ? tags.split(",").map((t) => t.trim()) : [],
// //       mimetype: req.file.mimetype,
// //       size: req.file.size,
// //       path: `/uploads/${req.file.filename}`,
// //     });

// //     await newFile.save();
// //     await Log.create({
// //   userId,
// //   action: "ADD",
// //   fileId: newFile._id,
// //   fileName: newFile.customName || newFile.originalname,
// // });

// //     res.json({ message: "File uploaded successfully", file: newFile });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });


// // // @route GET /api/files
// // // @route GET /api/files
// // router.get("/", async (req, res) => {
// //   try {
// //     const { userId, folderId } = req.query;
// //     if (!userId) return res.status(400).json({ error: "Missing userId" });

// //     let query = { userId };
// //     if (folderId) query.folderId = folderId; // 👈 filter files by folder

// //     const files = await File.find(query).sort({ createdAt: -1 });
// //     res.json(files);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });




// // // router.get("/", async (req, res) => {
// // //   try {
// // //     const userId = req.query.userId;
// // //     if (!userId) return res.status(400).json({ error: "Missing userId" });

// // //     const files = await File.find({ userId }).sort({ createdAt: -1 });
// // //     res.json(files);
// // //   } catch (err) {
// // //     console.error(err);
// // //     res.status(500).json({ error: "Server error" });
// // //   }
// // // });

// // // @route GET /api/files/:id/download
// // // @route GET /api/files/:id/download
// // router.get("/:id/download", async (req, res) => {
// //   try {
// //     const file = await File.findById(req.params.id);
// //     if (!file) return res.status(404).json({ error: "File not found" });

// //     // 👇 increment downloads
// //     file.downloads = (file.downloads || 0) + 1;
// //     await file.save();

// //     const filePath = path.resolve("uploads", file.filename);
// //     res.download(filePath, file.originalname);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });



// // // router.get("/:id/download", async (req, res) => {
// // //   try {
// // //     const file = await File.findById(req.params.id);
// // //     if (!file) return res.status(404).json({ error: "File not found" });

// // //     const filePath = path.resolve("uploads", file.filename);
// // //     res.download(filePath, file.originalname);
// // //   } catch (err) {
// // //     console.error(err);
// // //     res.status(500).json({ error: "Server error" });
// // //   }
// // // });


// // // @route DELETE /api/files/:id
// // router.delete("/:id", async (req, res) => {
// //   try {
// //     // 1️⃣ Find the file first (do NOT delete yet)
// //     const file = await File.findById(req.params.id);
// //     if (!file) return res.status(404).json({ error: "File not found" });

// //     // 2️⃣ Create log BEFORE deleting
// //     await Log.create({
// //       userId: file.userId,
// //       action: "DELETE",
// //       fileId: file._id,
// //       fileName: file.customName || file.originalname,
// //     });

// //     // 3️⃣ Delete the file from DB
// //     await File.findByIdAndDelete(req.params.id);

// //     // 4️⃣ Delete the file from disk
// //     const filePath = path.resolve("uploads", file.filename);
// //     fs.unlink(filePath, (err) => {
// //       if (err) console.error("Failed to delete file from disk:", err);
// //     });

// //     res.json({ message: "File deleted successfully" });
// //   } catch (err) {
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });




// // router.delete("/:id", async (req, res) => {
// //   try {
// //     const file = await File.findByIdAndDelete(req.params.id);
// //     if (!file) return res.status(404).json({ error: "File not found" });
// //     await Log.create({
// //   userId: file.userId,
// //   action: "DELETE",
// //   fileId: file._id,
// //   fileName: file.customName || file.originalname,
// // });


// //     const filePath = path.resolve("uploads", file.filename);
// //     fs.unlink(filePath, (err) => {
// //       if (err) console.error("Failed to delete file from disk:", err);
// //     });

// //     res.json({ message: "File deleted successfully" });
// //   } catch (err) {
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });


// // @route PATCH /api/files/:id
// router.patch("/:id", async (req, res) => {
//   try {
//     const updates = req.body; // e.g., { favorite: true }
//     const file = await File.findByIdAndUpdate(req.params.id, updates, { new: true });
//     if (!file) return res.status(404).json({ error: "File not found" });
//     await Log.create({
//   userId: file.userId,
//   action: "EDIT",
//   fileId: file._id,
//   fileName: file.customName || file.originalname,
// });


//     res.json(file); // return updated file
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });



// // GET logs for user
// router.get("/logs/user/:userId", async (req, res) => {
//   try {
//     const logs = await Log.find({ userId: req.params.userId })
//       .sort({ timestamp: -1 })
//       .limit(20); // last 20 activities
//     res.json(logs);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });



// export default router;






// import express from "express";
// import multer from "multer";
// import File from "../models/File.js";
// import path from "path";
// import fs from "fs";

// const router = express.Router();

// // Configure multer (store files locally in /uploads)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage });

// // @route POST /api/files/upload
// router.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     const { description, tags, userId } = req.body;
//     if (!userId) return res.status(400).json({ error: "Missing userId" });

//     // const newFile = new File({
//     //   userId,
//     //   filename: req.file.filename,
//     //   originalname: req.file.originalname,
//     //   description,
//     //   tags: tags ? tags.split(",").map((t) => t.trim()) : [],
//     //   mimetype: req.file.mimetype,
//     //   size: req.file.size,
//     //   path: req.file.path,
//     // });

// //     const newFile = new File({
// //   userId,
// //   filename: req.file.filename,
// //   originalname: req.file.originalname,
// //   description,
// //   tags: tags ? tags.split(",").map((t) => t.trim()) : [],
// //   mimetype: req.file.mimetype,
// //   size: req.file.size,
// //   path: `/uploads/${req.file.filename}`,   // ✅ normalized for URLs
// // });

// //     const newFile = new File({
// //   userId,
// //   filename: req.file.filename,
// //   originalname: req.file.originalname,
// //   description,
// //   tags: tags ? tags.split(",").map((t) => t.trim()) : [],
// //   mimetype: req.file.mimetype,
// //   size: req.file.size,
// //   path: `uploads/${req.file.filename}`,  // ✅ always clean
// // });

// const newFile = new File({
//   userId,
//   filename: req.file.filename, // 👉 only the safe filename
//   originalname: req.file.originalname,
//   description,
//   tags: tags ? tags.split(",").map((t) => t.trim()) : [],
//   mimetype: req.file.mimetype,
//   size: req.file.size,
//   path: `/uploads/${req.file.filename}`, // ✅ always clean, starts with /uploads
// });

//     await newFile.save();
//     res.json({ message: "File uploaded successfully", file: newFile });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });


// // @route GET /api/files
// // router.get("/", async (req, res) => {
// //   try {
// //     const files = await File.find().sort({ createdAt: -1 });
// //     res.json(files);
// //   } catch (err) {
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });



// // @route GET /api/files
// router.get("/", async (req, res) => {
//   try {
//     const userId = req.query.userId; // ✅ get userId from query
//     if (!userId) return res.status(400).json({ error: "Missing userId" });

//     const files = await File.find({ userId }).sort({ createdAt: -1 }); // ✅ filter by userId
//     res.json(files);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });




// // @route GET /api/files/:id/download
// // router.get("/:id/download", async (req, res) => {
// //   try {
// //     const file = await File.findById(req.params.id);
// //     if (!file) return res.status(404).json({ error: "File not found" });

// //     res.download(path.resolve(file.path), file.originalname);
// //   } catch (err) {
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });


// // @route GET /api/files/:id/download
// router.get("/:id/download", async (req, res) => {
//   try {
//     const file = await File.findById(req.params.id);
//     if (!file) return res.status(404).json({ error: "File not found" });

//     // Normalize path: we stored `/uploads/filename`
//     const filePath = path.resolve("uploads", file.filename);

//     res.download(filePath, file.originalname);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });


// // @route DELETE /api/files/:id
// // router.delete("/:id", async (req, res) => {
// //   try {
// //     const file = await File.findByIdAndDelete(req.params.id);
// //     if (!file) return res.status(404).json({ error: "File not found" });

// //     res.json({ message: "File deleted successfully" });
// //   } catch (err) {
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });


// router.delete("/:id", async (req, res) => {
//   try {
//     const file = await File.findByIdAndDelete(req.params.id);
//     if (!file) return res.status(404).json({ error: "File not found" });

//     const filePath = path.resolve("uploads", file.filename);
//     fs.unlink(filePath, (err) => {
//       if (err) console.error("Failed to delete file from disk:", err);
//     });

//     res.json({ message: "File deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// export default router;
