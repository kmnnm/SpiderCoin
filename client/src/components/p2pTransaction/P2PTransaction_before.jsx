import "./P2PTransaction.scss";
import { TextField } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useCookies } from "react-cookie";

import jwtDecode from "jwt-decode";
import _ from "lodash";

const P2PTransaction = ({ peer }) => {
    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState(1);
    const [privatekey, setPrivatekey] = useState("");

    const [tokenUser, setTokenUser, removeCookie] = useCookies(["x_auth"]);

    if (_.isEmpty(tokenUser)) {
        return (
            <>
                <div>
                    <h1>로그인해라</h1>
                </div>
            </>
        );
    } else if (!_.isEmpty(tokenUser)) {
        const user = jwtDecode(tokenUser.x_auth);

        const params = {
            method: "post",
            baseURL: `http://localhost:${peer}`,
            url: "/p2psendtransaction",
            data: {
                TxInAddress: user.address,
                TxOutAddress: address,
                amount: amount,
                sign: privatekey,
            },
        };

        const addTx = async () => {
            const result = await axios.request(params);
        };

        const textOnAddress = (e) => {
            setAddress(e.target.value);
        };
        const textOnAmount = (e) => {
            setAmount(parseInt(e.target.value));
        };
        const textOnPrivateKey = (e) => {
            setPrivatekey(e.target.value);
        };

        return (
            <div className="transaction_container">
                <div className="transaction_title">
                    Transaction page! port: {peer}
                </div>
                <div className="transaction_textField">
                    <TextField
                        required
                        label="Wallet Address"
                        variant="standard"
                        name="address"
                        onChange={textOnAddress}
                        sx={{ width: "100%", displayPrint: "block" }}
                    />
                    <TextField
                        required
                        label="PrivateKey"
                        variant="standard"
                        name="privatekey"
                        onChange={textOnPrivateKey}
                        sx={{
                            width: "100%",
                            displayPrint: "block",
                            marginTop: "20px",
                        }}
                    />
                    <TextField
                        required
                        label="Amount"
                        variant="standard"
                        name="amount"
                        onChange={textOnAmount}
                        sx={{
                            width: 200,
                            displayPrint: "block",
                            marginTop: "20px",
                        }}
                    />
                    <Button onClick={addTx} className="transaction_submit_btn">
                        Add Transaction
                    </Button>
                </div>
            </div>
        );
    }
};
export default P2PTransaction;
