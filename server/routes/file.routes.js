"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = __importDefault(require("../middleware/auth.middleware.js"));
const fileController_js_1 = require("../controllers/fileController.js");
const router = (0, express_1.Router)();
router.post('', auth_middleware_js_1.default, fileController_js_1.FileController.createDir);
router.get('', auth_middleware_js_1.default, fileController_js_1.FileController.getFiles);
router.post('/upload', auth_middleware_js_1.default, fileController_js_1.FileController.uploadFile);
router.post('/download', auth_middleware_js_1.default, fileController_js_1.FileController.downloadFile);
router.delete('/delete', auth_middleware_js_1.default, fileController_js_1.FileController.deleteFile);
router.post('/avatar', auth_middleware_js_1.default, fileController_js_1.FileController.uploadAvatar);
router.delete('/avatar', auth_middleware_js_1.default, fileController_js_1.FileController.deleteAvatar);
exports.default = router;
//# sourceMappingURL=file.routes.js.map