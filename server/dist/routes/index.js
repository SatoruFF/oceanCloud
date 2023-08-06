import { Router } from 'express';
import regRouter from './auth.routes.js';
import fileRouter from './file.routes.js';
const router = Router();
router.use('/user', regRouter);
router.use('/file', fileRouter);
export default router;
//# sourceMappingURL=index.js.map