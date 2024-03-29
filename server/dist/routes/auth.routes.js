import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { check } from "express-validator";
import authMiddleware from '../middleware/auth.middleware.js';
const router = Router();
router.post('/register', [
    check('email', 'Uncorrect email').isEmail(),
    check('password', 'Uncorrect password').isLength({
        min: 3,
        max: 24
    })
], UserController.registration);
router.post('/login', UserController.login);
router.get('/auth', authMiddleware, UserController.auth);
router.patch('/changeinfo', [check('email', 'Uncorrect email').isEmail()], authMiddleware, UserController.changeInfo);
router.get('/activate/:link', authMiddleware, UserController.activate);
router.get('/refresh', authMiddleware, UserController.refresh);
router.post('/logout', authMiddleware, UserController.logout);
export default router;
//# sourceMappingURL=auth.routes.js.map