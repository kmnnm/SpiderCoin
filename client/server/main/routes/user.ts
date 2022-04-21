import express = require("express");
import { Response, Request, NextFunction } from "express";
import bcrypt = require("bcrypt");
import jwt = require("jsonwebtoken");
import "dotenv/config";

import { db } from "../../database/config/db";
import { verifyToken } from "./middlewares";
import { generatePrivateKey } from "../../wallet/wallet";
import { ec } from "elliptic";

const EC = new ec("secp256k1");
const router: express.Router = express.Router();

router.post("/signin", async (req: express.Request, res: express.Response) => {
    const { email, password } = req.body;
    const hash = await bcrypt.hash(password, 12);

    db.query(`SELECT * FROM user WHERE email='${email}'`, (err, rows: any) => {
        if (err) {
            console.log(err);
            return res.send({ data: "fail" });
        }
        if (rows.length === 0) {
            return res.send({ data: "failEmail" });
        }
        bcrypt.compare(password, rows[0].password, (err, result) => {
            if (err) {
                console.log(err);
                return res.send({ data: "failPassword" });
            } else if (result == false) {
                return res.send({ data: "failPassword" });
            }

            const token: string = jwt.sign(
                {
                    email,
                    address: rows[0].publickey,
                },
                (process.env.ACCESS_TOKEN_SECRET as string) ||
                    "JwtSecretHahagOgo",
                {
                    expiresIn: "5m", // 만료 : 5분
                    issuer: "spider", // 발행자
                }
            );
            console.log("토큰값 보자", token);
            console.log(jwt.decode(token));
            return res
                .cookie("x_auth", token.toString(), {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000,
                })
                .status(200)
                .json({
                    data: "success",
                    token: token,
                });
            // return res.status(200).json({
            //     message: 'tokenOk',
            //     token: token
            // })
        });
    });
});

router.get(
    "/auth",
    verifyToken,
    (req: express.Request, res: express.Response) => {
        res.send({ user: (<any>req).decoded.email });
    }
);

router.get("/logout", (req, res) => {
    res.clearCookie("x_auth").redirect("/");
    //res.redirect("/");
});

router.post("/signup", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const hash = await bcrypt.hash(password, 12);

    const privatekey = generatePrivateKey();
    const key = EC.keyFromPrivate(privatekey, "hex");
    const publickey = key.getPublic().encode("hex", false);

    if (email == "") {
        return res.send({ data: "emptyEmail" });
    }
    if (password == "") {
        return res.send({ data: "emptyPassword" });
    }
    const registerUser = (
        email: any,
        password: any,
        publickey: string,
        privatekey: string
    ) => {
        const sql = `INSERT INTO user(email,password,publickey,privatekey) VALUES ("${email}","${password}","${publickey}","${privatekey}")`;
        db.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                return res.send({ data: "fail" });
            }
            return res.send({ data: "success", key: privatekey });
        });
    };

    registerUser(email, hash, publickey, privatekey);
});

export = router;
