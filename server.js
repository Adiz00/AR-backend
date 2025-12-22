import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';  
import listRoutes from './routes/listRoutes.js'; 
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import Asset from './models/Assets.js';
import client from './utils/openai.js';
import OpenAI from 'openai';
import cloudinary from './config/cloudnary.js';
import { pipeline } from "@xenova/transformers";
import axios from 'axios';


// TEMP folder to store uploads
// const storage = multer.memoryStorage();  // keeps file in RAM, safer for AI detection
// const upload = multer({ storage });

// ---------- MULTER CONFIG ----------
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Ensure uploads folder exists
//     if (!fs.existsSync("uploads")) {
//       fs.mkdirSync("uploads");
//     }
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   }
// });

// const upload = multer({ storage });
// ------------------------------------

// TEMP memory storage (we are NOT saving to disk)
const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Your sample images already hosted on Cloudinary


//  Full avatar image 
// https://collection.cloudinary.com/dw9xedh3z/925365d09b134f4e2e909f1b23671a65

// -----------------------
// SAMPLE ITEM URLS
// You can move these to DB later. Must be public URLs.
// -----------------------
const SAMPLE_IMAGES = [
  { type: "shirt", url: "https://res.cloudinary.com/dw9xedh3z/image/upload/v1764722706/WhatsApp_Image_2025-11-28_at_9.49.13_PM_yt6ktq-removebg-preview_p2bz31.png" },
  { type: "shirt", url: "https://res.cloudinary.com/dw9xedh3z/image/upload/v1764722706/WhatsApp_Image_2025-11-28_at_9.54.54_PM_wlghyy-removebg-preview_c8vfxk.png" },
  { type: "shirt", url: "https://res.cloudinary.com/dw9xedh3z/image/upload/v1764793726/avatar-shirtr4-removebg-preview_dia0ti.png" },
  { type: "shirt", url: "https://res.cloudinary.com/dw9xedh3z/image/upload/v1764793727/avatar-shirt3-removebg-preview_hn4p9e.png" },
  { type: "pant", url: "https://res.cloudinary.com/dw9xedh3z/image/upload/v1764723034/WhatsApp_Image_2025-11-28_at_9.49.44_PM_y1jdin-removebg-preview_uespop.png" },
  { type: "pant", url: "https://res.cloudinary.com/dw9xedh3z/image/upload/v1764723034/WhatsApp_Image_2025-11-28_at_9.56.00_PM_my3jbt-removebg-preview_s40166.png" },
  { type: "pant", url: "https://res.cloudinary.com/dw9xedh3z/image/upload/v1764793727/avatar-pant4-removebg-preview_mqpy1z.png" },
  { type: "pant", url: "https://res.cloudinary.com/dw9xedh3z/image/upload/v1764793739/avatar-pant3-removebg-preview_eq78vd.png" },
  { type: "shoe", url: "https://res.cloudinary.com/dw9xedh3z/image/upload/v1764723035/WhatsApp_Image_2025-11-28_at_9.56.35_PM_zdkare-removebg-preview_fc2lyx.png" },
  { type: "shoe", url: "https://res.cloudinary.com/dw9xedh3z/image/upload/v1764723035/WhatsApp_Image_2025-11-28_at_9.50.13_PM_nwfqwd-removebg-preview_mwfeoe.png" },
  { type: "shoe", url: "https://res.cloudinary.com/dw9xedh3z/image/upload/v1764793725/avatar-shoes4-removebg-preview_wohotj.png" },
  { type: "shoe", url: "https://res.cloudinary.com/dw9xedh3z/image/upload/v1764793726/avatar-shoes3-removebg-preview_mtoryo.png" },
  { type: "outfit", url: "https://res.cloudinary.com/dw9xedh3z/image/upload/v1765550392/for-removebg-preview_mktkxs.png" },
  { type: "outfit", url: "https://res.cloudinary.com/dw9xedh3z/image/upload/v1766237894/black_formal_d9dmvu.png" },
  { type: "outfit", url: "https://res.cloudinary.com/dw9xedh3z/image/upload/v1766237894/yellow_fnd7w4.png" },
  { type: "outfit", url: "https://res.cloudinary.com/dw9xedh3z/image/upload/v1766237894/black_for_bl8zqz.png" },
  { type: "outfit", url: "https://res.cloudinary.com/dw9xedh3z/image/upload/v1766237894/cas_tdgvv8.png" },
  { type: "outfit", url: "https://res.cloudinary.com/dw9xedh3z/image/upload/v1766237894/men_b_aojvdf.png" },
  { type: "outfit", url: "https://res.cloudinary.com/dw9xedh3z/image/upload/v1766237894/men_bf_o9gczk.png" },
  
];

// -----------------------
// 1️⃣ FUNCTION: COMPARE ONE ITEM WITH AVATAR
// -----------------------
async function compareImages(avatarUrl, itemUrl) {
  const result = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: avatarUrl } },
          { type: "image_url", image_url: { url: itemUrl } },
          {
            type: "text",
            text: "Does the avatar wear this exact clothing item? Answer ONLY 'yes' or 'no'.",
          },
        ],
      },
    ],
  });

  return result.choices[0].message.content.trim().toLowerCase();
}

// -----------------------
// 2️⃣ FUNCTION: CHECK ALL CLOTHING ITEMS
// -----------------------
async function detectClothes(avatarUrl) {
  let detected = { shirt: null, pant: null, shoe: null };

  for (const item of SAMPLE_IMAGES) {
    const answer = await compareImages(avatarUrl, item.url);

    console.log(` ${answer}`);

    if (answer === "yes") {
      detected[item.type] = item.url;
    }
  }

  return detected;
}




const app = express();
app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:5173' || 'http://localhost:4173' || 'http://localhost:5000D', // frontend origin
  origin: 'http://localhost:5173' || 'http://localhost:4173' || 'http://localhost:5000D', // frontend origin
  credentials: true // allow cookies to be sent
}));


// Defensive middleware: if client sends Content-Type: application/json but body is empty
// remove the header so express.json will NOT attempt to parse an empty body and throw.
app.use((req, res, next) => {
  try {
    const contentType = (req.headers['content-type'] || '').toLowerCase();
    const contentLength = req.headers['content-length'];
    if (contentType.includes('application/json') && (!contentLength || parseInt(contentLength, 10) === 0)) {
      delete req.headers['content-type'];
    }
  } catch (e) {
    // ignore and continue to next middleware
  }
  next();
});

app.use(express.json());
app.use(cookieParser());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/list', listRoutes);






app.get('/api/avatar/:avatarId', async (req, res) => {
  const { avatarId } = req.params;
  // const apiKey = process.env.READY_PLAYER_ME_API_KEY

  try {
    // ✅ Fetch from the CDN instead of api.readyplayer.me
    const response = await fetch(`https://models.readyplayer.me/${avatarId}.json`);
    if (!response.ok) {
      return res.status(response.status).json({ message: "Avatar not found" });
    }

    const data = await response.json();
    res.json(data); // ✅ Send metadata back to frontend
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch avatar metadata" });
  }
});

// ---------------------- API ROUTE ----------------------
// app.post("/compare-avatar", upload.single("avatar"), async (req, res) => {
//   try {
//     console.log("Avatar received...");

//     // if (!req.file) {
//     //   return res.status(400).json({ error: "avatar file is required" });
//     // }

//     // Upload avatar buffer to Cloudinary
//     const uploadResult = await cloudinary.uploader.upload_stream(
//       { resource_type: "image" },
//       async (error, result) => {
//         if (error) {
//           console.error(error);
//           return res.status(500).json({ error: "Cloudinary upload failed" });
//         }

//         // const avatarUrl = result.secure_url;
//         const avatarUrl = 'https://collection.cloudinary.com/dw9xedh3z/925365d09b134f4e2e909f1b23671a65';

//         // ---- GET EMBEDDING FOR USER AVATAR ----
//         const avatarVec = await getEmbedding(avatarUrl);

//         // ---- GET EMBEDDINGS FOR SAMPLE IMAGES ----
//         const scores = [];

//         for (const sample of SAMPLE_IMAGES) {
//           const sampleVec = await getEmbedding(sample);
//           const similarity = cosineSimilarity(avatarVec, sampleVec);

//           scores.push({
//             sample,
//             similarity,
//           });
//         }

//         // Sort high to low
//         scores.sort((a, b) => b.similarity - a.similarity);

//         return res.json({
//           uploaded_avatar: avatarUrl,
//           best_match: scores[0],
//           comparisons: scores
//         });
//       }
//     );

//     uploadResult.end(req.file.buffer);

//   } catch (err) {
//     console.error("Server Error", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// 3️⃣ API: UPLOAD + DETECT CLOTHES
// -----------------------
// app.post("/api/detect", upload.single("avatar"), async (req, res) => {
app.post("/api/detect", async (req, res) => {
  try {
    // upload avatar to cloudinary
    // const result = await cloudinary.uploader.upload(req.file.path, {
    //   folder: "avatars",
    // });

    // const avatarUrl = result.secure_url;
    const avatarUrl = 'https://collection.cloudinary.com/dw9xedh3z/925365d09b134f4e2e909f1b23671a65';
    // now compare with all clothing items
    const detected = await detectClothes(avatarUrl);

    // delete local file
    // fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      avatarUrl,
      detected,
    });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ----------------------------
// 1) CLIP SIMILARITY CHECK
// ----------------------------
let clipModel = null;

// Load CLIP ONCE (Async but safe)
const clipReady = (async () => {
  clipModel = await pipeline("feature-extraction", "Xenova/clip-vit-base-patch32");
})();

// Safe helper to wait for model load
async function ensureClipLoaded() {
  if (!clipModel) await clipReady;
}

// Get embedding from image URL
async function getClipEmbedding(url) {
  await ensureClipLoaded();

  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());

  // Xenova returns object, not function
  const out = await clipModel(buffer, {
    pooling: "mean",
    normalize: true,
  });

  return out.data;
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, x, i) => sum + x * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, x) => sum + x * x, 0));
  const magB = Math.sqrt(b.reduce((sum, x) => sum + x * x, 0));
  return dot / (magA * magB);
}

app.post("/similarity/clip", async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    // const avatarUrl = 'https://res.cloudinary.com/dw9xedh3z/image/upload/fl_preserve_transparency/v1764696718/avatar_nsoeq0.jpg?_s=public-appshttps://res.cloudinary.com/dw9xedh3z/image/upload/fl_preserve_transparency/v1764696718/avatar_nsoeq0.jpg?_s=public-appshttps://res.cloudinary.com/dw9xedh3z/image/upload/fl_preserve_transparency/v1764696718/avatar_nsoeq0.jpg?_s=public-appshttps://res.cloudinary.com/dw9xedh3z/image/upload/fl_preserve_transparency/v1764696718/avatar_nsoeq0.jpg?_s=public-apps';
    const itemUrls = SAMPLE_IMAGES;

     const results = [];

    for (const itemUrl of itemUrls) {
      // Call FastAPI /match endpoint
      const response = await axios.get("http://localhost:8000/match", {
        params: {
          big_url: avatarUrl,
          small_url: itemUrl.url
        }
      });
      console.log("Response from FastAPI:", response.data);
      const data = response.data;
      console.log(`Item: ${itemUrl}, Present: ${data.present}, Confidence: ${data.confidence}, Position: ${data.position}`);

      // Only include images that are present
      if (data.present) {
        results.push({
          itemUrl: itemUrl.url,
          type: itemUrl.type,
          confidence: data.confidence,
          position: data.position
        });
      }
    }

    res.json({ success: true, results });

  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});


// -------------------------------------------
// 2) YOLOv8 / YOLOv9 — OBJECT FOUND INSIDE?
// Using Ultralytics Cloud API
// -------------------------------------------
const YOLO_API_KEY = "YOUR_YOLO_API_KEY"; // https://hub.ultralytics.com/

app.post("/detect/yolo", async (req, res) => {
  try {
    const { avatarUrl, objectPrompt } = req.body;

    const yoloRes = await axios.post(
      "https://api.ultralytics.com/v1/predict/YOLOv8n",
      { input: avatarUrl },
      {
        headers: {
          "x-api-key": YOLO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const detections = yoloRes.data?.data?.detections || [];
    const found = detections.some((d) =>
      d.class.toLowerCase().includes(objectPrompt.toLowerCase())
    );

    res.json({
      success: true,
      found,
      detections,
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});






app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});


// Create HTTP server

const server = http.createServer(app);




mongoose.connect("mongodb+srv://am3161274_db_user:RienaLOUB8Z3yKRe@cluster0.kp2rdxc.mongodb.net/?appName=Cluster0").then(() => {
  console.log('MongoDB connected');
    // try {
    //     const db = mongoose.connection;
    //     // Listen for deletes on users collection and log them
    //     if (db && db.collection) {
    //         const usersColl = db.collection('users');
    //         const changeStream = usersColl.watch([{ $match: { operationType: 'delete' } }], { fullDocument: 'default' });
    //         changeStream.on('change', async (change) => {
    //             try {
    //                 const deletedId = change.documentKey?._id;
    //                 console.warn('User deletion detected from change stream. _id=', deletedId, 'change=', change);
    //                 // We can't get fullDocument on delete, but change has documentKey. Optionally fetch from oplog or keep shadow copies.
    //                 await UserDeletionLog.create({ userId: deletedId, reason: 'deleted_via_change_stream', doc: null });
    //             } catch (err) {
    //                 console.error('Error logging user deletion from change stream:', err);
    //             }
    //         });
    //         changeStream.on('error', (err) => {
    //             console.error('User change stream error:', err);
    //         });
    //     } else {
    //         console.warn('Cannot open users collection change stream: db.collection not available');
    //     }
    // } catch (err) {
    //     console.error('Failed to initialize user deletion change stream:', err);
    // }
  // Use HTTP server instead of app
  server.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}).catch(err => console.log(err));
