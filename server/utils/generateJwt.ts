import jwt from "jsonwebtoken";

export const generateJwt = (id: number) => {
    const accessToken = jwt.sign(
      {
        id,
      },
      process.env.ACCESS_SECRET_KEY as string,
      {
        expiresIn: "30m",
      }
    );

    const refreshToken = jwt.sign(
      {
        id,
      },
      process.env.REFRESH_SECRET_KEY as string,
      {
        expiresIn: "30d",
      }
    );

    return {accessToken, refreshToken}
  };