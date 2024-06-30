import 'dotenv/config'
import createError from "http-errors"
import _ from "lodash";
import jwt from "jsonwebtoken";

export const validateAccessToken = (accessToken) => {
    const user = jwt.verify(accessToken, process.env.ACCESS_SECRET_KEY)
    return user;
}

export const validateRefreshToken = (refreshToken) => {
    const user = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY)
    return user;
}