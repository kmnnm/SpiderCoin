import { TextField } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";

const Peer1 = () => {
    const [peerPort, setPeerPort] = useState("6002");
    const [statePeers, setStatePeers] = useState([]);

    const getPeers = async () => {
        const params = {
            method: "get",
            baseURL: "http://localhost:3001",
            url: "/peers",
        };
        const result = await axios.request(params);
        //console.log("Connected peers : ", result.data);
        setStatePeers(result.data);
    };

    const addPeers = () => {
        const peerList = peerPort.split(" ");
        peerList.forEach(async (peer) => {
            const params = {
                method: "post",
                baseURL: "http://localhost:3001",
                url: "/addPeer",
                data: { data: [`ws://localhost:${peer}`] },
            };
            const result = await axios.request(params);
            console.log("Add peers : ", result.data);
        });
    };

    const textOnChange = (e) => {
        setPeerPort(e.target.value);
    };

    const [address, setAddress] = useState("");
    const [privateKey, setPrivateKey] = useState("");
    const [amount, setAmount] = useState(1);

    const textOnAddress = (e) => {
        setAddress(e.target.value);
    };
    const textOnAmount = (e) => {
        setAmount(parseInt(e.target.value));
    };
    const textOnPrivatekey = (e) => {
        setPrivateKey(e.target.value);
    };

    const addWallet = async () => {
        const params = {
            method: "get",
            baseURL: "http://localhost:3001",
            url: "/addwallet",
        };
        const result = await axios.request(params);
        setAddress(result.data.data.publickey);
        setPrivateKey(result.data.data.privatekey);
    };

    const params = {
        method: "post",
        baseURL: "http://localhost:3001",
        url: "/sendtransaction",
        data: { address, amount, privateKey },
    };
    const addTx = async () => {
        const result = await axios.request(params);
    };

    return (
        <div className="peer_container">
            <div className="peer_name">Peer1</div>
            <div className="peer_port">(Port: 3001, Peer: 6001)</div>
            <div className="peer_getPeers">
                <Button onClick={getPeers}>Get Peers</Button>
                {statePeers.join(" , ")}
            </div>

            <div className="peer_textField">
                <TextField
                    required
                    label="Peer Port default : 6002"
                    variant="standard"
                    helperText="Using space to add multiple peers (ex. 6002 6003)"
                    name="port"
                    onChange={textOnChange}
                />
                <Button onClick={addPeers}>Add Peers</Button>
            </div>

            {/* <div className="peer_addWallet">
                <Button onClick={addWallet}>Add Wallet</Button>
                <div className="transaction_textField">
                    <TextField
                        required
                        label="TxOut"
                        value={address}
                        variant="standard"
                        name="address"
                        onChange={textOnAddress}
                        sx={{ width: "100%", displayPrint: "block" }}
                    />
                    <TextField
                        required
                        label="PrivateKey"
                        value={privateKey}
                        variant="standard"
                        name="address"
                        onChange={textOnPrivatekey}
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
            </div> */}
        </div>
    );
};

export default Peer1;
