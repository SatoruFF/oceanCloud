import { Router } from "express";
import authMiddleware from '../middleware/auth.middleware.js';
import { FileController } from "../controllers/fileController.js";

const router = new Router();

router.post('', authMiddleware, FileController.createDir)

export default router;