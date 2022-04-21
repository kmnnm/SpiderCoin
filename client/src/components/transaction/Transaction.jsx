import "./Transaction.scss";
import { TextField } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { Button } from "react-bootstrap";

const Transaction = ({ peer }) => {
    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState(1);

    const params = {
        method: "post",
        baseURL: `http://localhost:${peer}`,
        url: "/sendtransaction",
        data: { address: address, amount: amount },
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

    return (
        <div className="transaction_container">
            <div className="transaction_title">
                Transaction page! Port : {peer}
            </div>
            <div className="transaction_textField">
                <TextField
                    required
                    label="Input Wallet Address"
                    variant="standard"
                    name="address"
                    onChange={textOnAddress}
                    sx={{ width: "100%", displayPrint: "block" }}
                />
                <TextField
                    required
                    label="Input Amount"
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
};

export default Transaction;
