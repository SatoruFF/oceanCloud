import {
    Router
} from "express";
import {
    UserController
} from "../controllers/userController.js";
import {
    check
} from "express-validator";
import authMiddleware from '../middleware/auth.middleware.js';

const router = new Router()

router.post('/register',
    [
        check('email', 'Uncorrect email').isEmail(),
        check('password', 'Uncorrect password').isLength({
            min: 3,
            max: 24
        })
    ],
UserController.registration)

router.post('/login', UserController.login)

router.get('/auth', authMiddleware, UserController.auth)

export default router