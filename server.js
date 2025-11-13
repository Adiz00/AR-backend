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

// Needed for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

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

// app.get('/api/avatar/:avatarId', async (req, res) => {
//   const { avatarId } = req.params;
//   // const apiKey = process.env.READY_PLAYER_ME_API_KEY

//   try {
//     // ✅ Fetch from the CDN instead of api.readyplayer.me
//     const response = await fetch(`https://models.readyplayer.me/${avatarId}.json`);
//     if (!response.ok) {
//       return res.status(response.status).json({ message: "Avatar not found" });
//     }

//     const data = await response.json();
//     res.json(data); // ✅ Send metadata back to frontend
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to fetch avatar metadata" });
//   }
// });

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
