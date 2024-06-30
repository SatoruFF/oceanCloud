import jwt from "jsonwebtoken";
import 'dotenv/config';
export const generateJwt = (id) => {
    const accessToken = jwt.sign({
        id,
    }, process.env.ACCESS_SECRET_KEY, {
        expiresIn: "1h",
    });
    const refreshToken = jwt.sign({
        id,
    }, process.env.REFRESH_SECRET_KEY, {
        expiresIn: "30d",
    });
    return { accessToken, refreshToken };
};
//# sourceMappingURL=generateJwt.js.map