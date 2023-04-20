import { Router } from 'express';
import regRouter from './auth.routes.js'
const router = new Router();

router.use('/user', regRouter)

export default router