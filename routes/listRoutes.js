import express from 'express';
import { authMiddleware } from '../middleware/authMiddeleware.js';
import {
    getAllCustomers,
    getAllNews
    
} from '../controller/listController.js';

const router = express.Router();

// router.get('/all-customers', authMiddleware, getAllCustomers);
router.get('/all-news', getAllNews);



export default router;
