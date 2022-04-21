import bodyParser = require("body-parser");
import express = require("express");
import { Request, Response } from "express";
const helmet = require("helmet");
import "dotenv/config";
import cookieParser = require("cookie-parser");
import _ = require("lodash");

import Blockchain from "../blockchain/blockchain";
import { TransactionPool } from "../transactionPool/transactionPool";
import {
    findUnspentTxOuts,
    generatePrivateKey,
    getBalance,
    getPublicFromWallet,
    initWallet,
} from "../wallet/wallet";
import {
    initP2PServer,
    getSockets,
    connectToPeers,
    broadcastLatest,
    broadcastTransctionPool,
} from "../p2p/p2p";
import { cors } from "./cors";
import user = require("./routes/user");
import {
    Transaction,
    TxFunctions,
    UnspentTxOut,
} from "../transaction/transaction";
import Block from "../blockchain/block";
import { ec } from "elliptic";

const EC = new ec("secp256k1");

const blockchain: Blockchain = new Blockchain();
let unspentTxOuts = TxFunctions.processTransactions(
    Block.getGenesisBlock().data,
    [],
    0
);
let transactionPool: Transaction[] = [];

const app = express();
app.use(helmet());
app.use(cors);
app.disable("x-powered-by");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api/user", user);

export const http_port: number =
    parseInt(process.env.HTTP_PORT as string) || 3001;

export const p2p_port: number =
    parseInt(process.env.P2P_PORT as string) || 6001;

const initHttpServer = (port: number) => {
    app.get("/", (req: Request, res: Response) => {
        res.send("welcome!");
    });

    app.get("/balance", (req: Request, res: Response) => {
        if (unspentTxOuts !== null) {
            const balance = getBalance(getPublicFromWallet(), unspentTxOuts);
            res.send({ balance: balance });
        } else {
            res.status(404).send("Invalid unspentTxOuts");
            throw Error("Invalid unspentTxOuts");
        }
    });
    app.get("/balance/:id", (req: Request, res: Response) => {
        const myAddress: string = req.params.id;

        if (unspentTxOuts !== null) {
            const balance = getBalance(myAddress, unspentTxOuts);
            res.send({ balance: balance });
        } else {
            res.status(404).send("Invalid unspentTxOuts");
            throw Error("Invalid unspentTxOuts");
        }
    });

    app.get("/blocks", (req: Request, res: Response) => {
        res.json(blockchain.chain);
    });

    app.get("/address", (req: Request, res: Response) => {
        const address: string = getPublicFromWallet();
        res.send({ address: address });
    });

    app.get("/peers", (req, res) => {
        let sockInfo: string[] = [];
        getSockets().forEach((s: any) => {
            sockInfo.push(s._socket.remoteAddress + ":" + s._socket.remotePort);
        });
        console.log(sockInfo);
        res.send(sockInfo);
    });

    app.post("/addPeer", (req: Request, res: Response) => {
        const data: string[] = req.body.data;
        connectToPeers(data);
        console.log(data);
        res.send(data);
    });
    app.get("/addwallet", (req: Request, res: Response) => {
        const privatekey = generatePrivateKey();
        const key = EC.keyFromPrivate(privatekey, "hex");
        const publickey = key.getPublic().encode("hex", false);
        res.send({ data: { publickey, privatekey } });
    });

    app.post("/mineBlock", (req: Request, res: Response) => {
        const address: string = req.body.address;
        console.log(address);
        const data: Transaction[] = Blockchain.getBlockData(
            address,
            blockchain,
            transactionPool
        );
        console.log("mineBlock : ", data);
        const newBlock = blockchain.addBlock(data);
        broadcastLatest();

        if (unspentTxOuts !== null) {
            const newUnspentTxOuts: UnspentTxOut[] | null =
                TxFunctions.processTransactions(
                    newBlock.data,
                    unspentTxOuts,
                    newBlock.header.index
                );

            if (newUnspentTxOuts !== null) {
                // 새로운 UTXOs로 바꿈
                unspentTxOuts = newUnspentTxOuts;

                // Transaction Pool도 갱신해야함
                if (unspentTxOuts == null) {
                    res.send("Invalid unspentTxOuts");
                    throw Error("Invalid unspentTxOuts");
                }
                const invalidTxs = [];
                for (const tx of transactionPool) {
                    for (const txIn of tx.txIns) {
                        if (!TransactionPool.hasTxIn(txIn, unspentTxOuts)) {
                            invalidTxs.push(tx);
                            break;
                        }
                    }
                }
                // 찾은 트랜잭션들 제거
                if (invalidTxs.length > 0) {
                    console.log(
                        "Removing the following transactions from transaction pool: ",
                        JSON.stringify(invalidTxs)
                    );
                    transactionPool = _.without(transactionPool, ...invalidTxs);
                }
                TransactionPool.updateTransactionPool(
                    unspentTxOuts,
                    transactionPool
                );
                res.send("Mine Success");
            } else {
                res.send("Invalid newUnspentTxOuts");
                throw Error("Invalid newUnspentTxOuts.");
            }
        } else {
            res.send("Invalid unspentTxOuts");
            throw Error("Invalid unspentTxOuts");
        }
    });

    // app.post("/sendtransaction", (req, res) => {
    //     try {
    //         interface TxData {
    //             address: string;
    //             privateKey: string;
    //             amount: number;
    //         }
    //         const { address, privateKey, amount }: TxData = req.body;
    //         if (
    //             address === undefined ||
    //             amount === undefined ||
    //             privateKey == undefined
    //         ) {
    //             res.status(404).send("Invalid address or amount");
    //             throw Error("Invalid address or amount");
    //         }
    //         if (unspentTxOuts === null) {
    //             res.status(404).send("Invalid unspentTxOuts");
    //             throw Error("Invalid unspentTxOuts");
    //         } else {
    //             const newTransaciton = Blockchain.sendTransaction(
    //                 address,
    //                 amount,
    //                 privateKey,
    //                 unspentTxOuts,
    //                 transactionPool
    //             );
    //             console.log("asd1111f");
    //             res.send(newTransaciton);
    //         }
    //     } catch (error) {
    //         res.status(400).send("Sending transaction faild");
    //     }
    // });

    app.post("/p2psendtransaction", (req, res) => {
        try {
            interface TxData {
                TxInAddress: string;
                TxOutAddress: string;
                amount: number;
                sign: string;
            }

            const { TxInAddress, TxOutAddress, amount, sign }: TxData =
                req.body;
            console.log(TxOutAddress);
            console.log(amount);
            if (
                TxInAddress === undefined ||
                TxOutAddress == undefined ||
                amount == undefined ||
                sign === undefined
            ) {
                res.status(404).send({
                    error: "Invalid TxInAddress or TxOutAddress or amount or sign",
                    message:
                        "Invalid TxInAddress or TxOutAddress or amount or sign",
                });
                // throw Error(
                //     "Invalid TxInAddress or TxOutAddress or amount or sign"
                // );
            }
            if (unspentTxOuts === null) {
                res.status(404).send("Invalid unspentTxOuts");
                throw Error("Invalid unspentTxOuts");
            } else {
                const newTransaciton = Blockchain.p2pSendTransaction(
                    TxOutAddress,
                    amount,
                    sign,
                    unspentTxOuts,
                    transactionPool,
                    TxInAddress
                );
                broadcastTransctionPool();
                //res.send(newTransaciton);
                res.send({ newTransaciton, message: "success" });
            }
        } catch (error) {
            res.status(400).send("Sending transaction faild");
        }
    });

    // 전체 utxo 불러오기
    app.get("/utxos", (req: Request, res: Response) => {
        if (unspentTxOuts !== null) {
            res.send(Blockchain.getUnspentTxOuts(unspentTxOuts));
        } else {
            res.status(404).send("Invalid unspentTxOuts");
            throw Error("Invalid unspentTxOuts");
        }
    });

    // 내 지갑주소에 해당하는 utxo 불러오기
    app.get("/myutxos", (req: Request, res: Response) => {
        if (unspentTxOuts !== null) {
            res.send(Blockchain.getMyUnspentTxOutputs(unspentTxOuts));
        } else {
            res.status(404).send("Invalid unspentTxOuts");
            throw Error("Invalid unspentTxOuts");
        }
    });
    app.get("/myutxos/:address", (req: Request, res: Response) => {
        if (unspentTxOuts !== null) {
            const myUTXOs = findUnspentTxOuts(
                req.params.address,
                unspentTxOuts
            );
            res.send(myUTXOs);
        } else {
            res.status(404).send("Invalid unspentTxOuts");
            throw Error("Invalid unspentTxOuts");
        }
    });

    app.get("/transactionPool", (req: Request, res: Response) => {
        console.log(transactionPool);
        res.send(transactionPool);
    });

    ////////////////////////////////////////
};
initHttpServer(http_port);

const server = app.listen(http_port, () => {
    console.log(`
    ####################################
    🛡️  Server listening on port: ${http_port}🛡️
    ####################################`);
});

initP2PServer(p2p_port);
initWallet();
export { app, server, blockchain, unspentTxOuts, transactionPool };
