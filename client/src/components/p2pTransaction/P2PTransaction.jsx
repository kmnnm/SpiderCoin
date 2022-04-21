import "./P2PTransaction.scss";
import { TextField } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Accordion, Button, Form, Spinner } from "react-bootstrap";
import { ec } from "elliptic";
import MyUTXO from "../wallet/MyUTXO";
import { isNaN } from "lodash";

const EC = new ec("secp256k1");

const P2PTransaction = ({ peer }) => {
    const port = peer[0];
    const initPublickey = peer[1];
    const initPrivatekey = peer[2];
    const [publickey, setPublickey] = useState(initPublickey);
    const [privatekey, setPrivatekey] = useState(initPrivatekey);
    const [receiverAddress, setReceiverAddress] = useState("");
    const [amount, setAmount] = useState(0);
    const [peerUTXOs, setPeerUTXOs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);

    const renewWalletKeys = () => {
        const peerWalletKeys = generatePeerWallet();
        setPublickey(peerWalletKeys[0]);
        setPrivatekey(peerWalletKeys[1]);
    };

    const params = {
        method: "post",
        baseURL: `http://localhost:${port}`,
        url: "/p2psendtransaction",
        data: {
            TxInAddress: publickey,
            TxOutAddress: receiverAddress,
            amount: amount,
            sign: privatekey,
        },
    };

    const addTx = async () => {
        if (publickey.length !== 130) {
            alert("Invalid WalletAddress");
            window.location.reload();
            return false;
        }
        if (privatekey.length !== 64) {
            alert("Invalid Privatekey");
            window.location.reload();
            return false;
        }
        if (receiverAddress.length !== 130) {
            alert("Invalid Address");
            window.location.reload();
            return false;
        }
        if (isNaN(amount) || amount === 0) {
            alert("Invalid type of amount");
            window.location.reload();
            return false;
        }
        const result = await axios.request(params);
        console.log(result);
        if (result.data.message === "success") {
            alert("Transaction Success");
            window.location.reload();
        }
    };

    const textOnPublickey = (e) => {
        setPublickey(e.target.value);
    };
    const textOnPrivateKey = (e) => {
        setPrivatekey(e.target.value);
    };
    const textOnReceiverAddress = (e) => {
        setReceiverAddress(e.target.value);
    };
    const textOnAmount = (e) => {
        setAmount(parseInt(e.target.value));
    };

    const getPeerUTXOs = async (address) => {
        try {
            const { data } = await axios({
                method: "get",
                baseURL: `http://localhost:${port}`,
                url: `/myutxos/${publickey}`,
            });
            setPeerUTXOs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    const getBalance = async () => {
        const result = await axios.request({
            method: "get",
            baseURL: `http://localhost:${port}`,
            url: `balance/${publickey}`,
        });
        setBalance(result.data.balance);
    };

    useEffect(() => {
        getBalance();
        getPeerUTXOs(publickey);
    }, []);

    return (
        <div className="transaction_container">
            <div className="transaction_title">Port {port}</div>
            <div className="transaction_textField">
                <TextField
                    required
                    label="Balance"
                    variant="standard"
                    name="address"
                    sx={{ width: "10%", displayPrint: "block" }}
                    value={balance}
                />
                <TextField
                    required
                    label="Wallet Address"
                    variant="standard"
                    name="address"
                    onChange={textOnPublickey}
                    sx={{
                        width: "100%",
                        displayPrint: "block",
                        marginTop: "20px",
                    }}
                    value={publickey}
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
                    value={privatekey}
                />
                <TextField
                    required
                    label="ReceiverAddress"
                    variant="standard"
                    name="receiverAddress"
                    onChange={textOnReceiverAddress}
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
                <Button
                    onClick={renewWalletKeys}
                    variant="danger"
                    className="transaction_renew_btn"
                >
                    New Wallet address
                </Button>
                <Accordion>
                    <Accordion.Item>
                        <Accordion.Header>UTXOs</Accordion.Header>
                        <Accordion.Body>
                            {loading ? (
                                <Spinner animation="border" variant="dark" />
                            ) : (
                                peerUTXOs.map((utxo, index) => (
                                    <MyUTXO
                                        key={index}
                                        utxo={utxo}
                                        index={index}
                                    />
                                ))
                            )}
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </div>
        </div>
    );
};

const generatePeerWallet = () => {
    const keyPair = EC.genKeyPair();
    const privateKey = keyPair.getPrivate().toString(16);
    const key = EC.keyFromPrivate(privateKey, "hex");
    const publicKey = key.getPublic().encode("hex", false);

    return [publicKey, privateKey];
};

export default P2PTransaction;
