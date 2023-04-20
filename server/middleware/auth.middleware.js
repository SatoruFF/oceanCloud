import jwt from 'jsonwebtoken';
import config from 'config';

const authMiddle = (req, res, next) => {
    
    if (req.method === 'OPTIONS') {
        return next()
    }

    try {
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            return res.status(401).json({message: 'Auth error'})
        }
        const decoded = jwt.verify(token, config.get('SECRET-KEY'))
        req.user = decoded;
        next()
    } catch (e) {
        return res.status(401).json({message: 'Auth error', error: e.message})
    }
}

export default authMiddle;