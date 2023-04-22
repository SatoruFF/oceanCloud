import { Router } from 'express';
import regRouter from './auth.routes.js'
import fileRouter from './file.routes.js'
const router = new Router();

router.use('/user', regRouter)
router.use('/file', fileRouter)

export default router