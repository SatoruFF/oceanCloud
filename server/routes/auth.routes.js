"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_js_1 = require("../controllers/userController.js");
const express_validator_1 = require("express-validator");
const auth_middleware_js_1 = __importDefault(require("../middleware/auth.middleware.js"));
const router = (0, express_1.Router)();
router.post('/register', [
    (0, express_validator_1.check)('email', 'Uncorrect email').isEmail(),
    (0, express_validator_1.check)('password', 'Uncorrect password').isLength({
        min: 3,
        max: 24
    })
], userController_js_1.UserController.registration);
router.post('/login', userController_js_1.UserController.login);
router.get('/auth', auth_middleware_js_1.default, userController_js_1.UserController.auth);
router.patch('changeinfo', [(0, express_validator_1.check)('email', 'Uncorrect email').isEmail()], auth_middleware_js_1.default, userController_js_1.UserController.changeInfo);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map