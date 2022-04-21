import { Request, Response, NextFunction } from "express";

import jwt = require("jsonwebtoken");

export const verifyToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // 인증 ok
    try {
        let token = req.cookies.x_auth;
        (<any>req).decoded = jwt.verify(
            token,
            (process.env.ACCESS_TOKEN_SECRET as string) || "JwtSecretHahagOgo"
        );
        return next();
    } catch (err: any | unknown) {
        // 인증 nok
        // 토큰만료
        if (err.name == "TokenExpiredError") {
            return res.status(419).json({
                code: 419,
                message: "토큰이 만료되었습니다.",
            });
        }
        console.log(err);
        // 비밀키 일치 x
        return res.status(401).json({
            code: 401,
            message: "유효하지 않은 토큰입니다.",
        });
    }
};
// req.decoded 값 넘어감
