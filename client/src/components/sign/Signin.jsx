import "./Signin.scss";
import { Box, Button, TextField } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import PopupMsg from "../alert/PopupMsg";
import { useCookies } from "react-cookie";

export default function Signin() {
    const [inputInfo, setInputInfo] = useState({
        email: "",
        password: "",
    });
    const [signinResult, setSigninResult] = useState({
        type: "info",
        text: "If you don't have account, press SIGN-UP button!",
    });

    const [cookies, setCookie] = useCookies(["x_auth"]);

    const signInOnClick = async () => {
        console.log("click!");
        const url = "http://localhost:3001/api/user/signin";
        const response = await axios.post(url, inputInfo, {
            credentials: "include",
        });
        if (response.data.data.includes("success")) {
            setSigninResult({
                type: "success",
                text: "Sign-in success!",
            });
            setCookie("x_auth", response.data.token);
            window.location.replace("/");
        } else if (response.data.data.includes("failEmail")) {
            setSigninResult({
                type: "warning",
                text: "Wrong Email. Please try again.",
            });
        } else if (response.data.data.includes("failPassword")) {
            setSigninResult({
                type: "warning",
                text: "Wrong Password. Please try again.",
            });
        }
    };

    const signUpOnClick = async () => {
        window.location.replace("/signup");
    };

    const textOnChange = (e) => {
        setInputInfo({
            ...inputInfo,
            [e.target.name]: e.target.value,
        });
        setSigninResult({
            type: "info",
            text: "If you don't have account, press SIGN-UP button!",
        });
    };

    // useEffect(() => {
    // 	console.log(signinResult);
    // }, [signinResult]);

    return (
        <>
            <Box
                className="signin-container"
                component="form"
                sx={{
                    "& .MuiTextField-root": { m: 2, width: "40ch" },
                }}
                noValidate
                autoComplete="off"
            >
                <h1>Sign-in Page</h1>
                <div className="text-fields-box">
                    <TextField
                        required
                        label="Email"
                        variant="standard"
                        helperText="example@gmail.com"
                        name="email"
                        onChange={textOnChange}
                    />
                    <TextField
                        required
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        variant="standard"
                        name="password"
                        onChange={textOnChange}
                    />
                </div>

                <PopupMsg type={signinResult.type} text={signinResult.text} />

                <div className="buttons-box">
                    <Button
                        variant="contained"
                        size="medium"
                        color="secondary"
                        onClick={signUpOnClick}
                    >
                        Sign-up
                    </Button>
                    <Button
                        variant="contained"
                        size="medium"
                        onClick={signInOnClick}
                    >
                        Sign-in
                    </Button>
                </div>
            </Box>
        </>
    );
}
