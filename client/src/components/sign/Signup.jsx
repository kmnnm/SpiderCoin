import "./Signup.scss";
import { Box, Button, TextField } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import PopupMsg from "../alert/PopupMsg";
import { useNavigate } from "react-router-dom";

export default function Signup({ history }) {
    let navigate = useNavigate();
    const [inputInfo, setInputInfo] = useState({
        email: "",
        password: "",
    });
    const [signinResult, setSigninResult] = useState({
        type: "info",
        text: `Please fill out the forms and press the SUBMIT.`,
    });

    const submitOnClick = async () => {
        const url = "http://localhost:3001/api/user/signup";
        const response = await axios.post(url, inputInfo);
        if (response.data.data.includes("success")) {
            setSigninResult({
                type: "success",
                text: `Account was created successfully!. Replace to Signin automatically in few seconds`,
            });
            setTimeout(() => {
                navigate(`/yourkey/${response.data.key}`);
                // alert("your private key :", response.data.key);
                // window.location.replace("/signin");
            }, 2000);
        } else if (response.data.data.includes("fail")) {
            setSigninResult({
                type: "warning",
                text: "This Email is already used.",
            });
        }
    };

    const textOnChange = (e) => {
        setInputInfo({
            ...inputInfo,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <>
            <Box
                className="signup-container"
                component="form"
                sx={{
                    "& .MuiTextField-root": { m: 2, width: "40ch" },
                }}
                noValidate
                autoComplete="off"
            >
                <h1>Sign-up Page</h1>
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
                    <TextField
                        required
                        label="Repeat Password"
                        type="password"
                        autoComplete="current-password"
                        variant="standard"
                        name="passwordRepeat"
                        onChange={textOnChange}
                    />
                </div>

                <PopupMsg type={signinResult.type} text={signinResult.text} />

                <div className="buttons-box">
                    <Button
                        disabled={
                            inputInfo.password === inputInfo.passwordRepeat &&
                            inputInfo.password !== ""
                                ? false
                                : true
                        }
                        variant="contained"
                        size="medium"
                        onClick={submitOnClick}
                    >
                        SUBMIT
                    </Button>
                </div>
            </Box>
        </>
    );
}
