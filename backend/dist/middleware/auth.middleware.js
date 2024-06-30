import jwt from 'jsonwebtoken';
import 'dotenv/config';
const authMiddle = (req, res, next) => {
    var _a;
    if (req.method === 'OPTIONS') {
        return next();
    }
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Auth error' });
        }
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
        req.user = decoded;
        next();
    }
    catch (e) {
        return res.status(401).json({ message: 'Auth error', error: e.message });
    }
};
export default authMiddle;
//# sourceMappingURL=auth.middleware.js.map