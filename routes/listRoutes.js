/**
 * List Routes
 *
 * Defines routes for retrieving lists of data:
 * - Customer/user listings
 * - Fashion news articles
 * - Asset management endpoints
 */

import express from 'express';
import { authMiddleware } from '../middleware/authMiddeleware.js';
import {
    getAllCustomers,
    getAllNews

} from '../controller/listController.js';

const router = express.Router();

// Get all fashion news articles (public endpoint)
router.get('/all-news', getAllNews);

// Get all customers (commented out - requires authentication)
// router.get('/all-customers', authMiddleware, getAllCustomers);

export default router;
