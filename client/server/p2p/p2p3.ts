import WebSocket = require("ws");
import { Server } from "ws";
import Block from "../blockchain/block";
import Blockchain from "../blockchain/blockchain";
import { blockchain, unspentTxOuts, transactionPool } from "../main/main3";
import { Transaction } from "../transaction/transaction";
import { TransactionPool } from "../transactionPool/transactionPool";

const sockets: WebSocket[] = [];

enum MessageType {
    QUERY_LATEST,
    QUERY_ALL,
    RESPONSE_BLOCKCHAIN,
    QUERY_TRANSACTION_POOL,
    RESPONSE_TRANSACTION_POOL,
}

class Message {
    public type: MessageType;
    public data: any;
    constructor(type: MessageType, data: any) {
        (this.type = type), (this.data = data);
    }
}

const getSockets = (): WebSocket[] => sockets;

const initP2PServer = (p2pPort: number) => {
    const server: Server = new WebSocket.Server({ port: p2pPort });
    server.on("connection", (ws: WebSocket) => {
        initConnection(ws);
    });

    console.log("listening websocket p2p port on: " + p2pPort);
};

const initConnection = (ws: WebSocket) => {
    console.log("initConnection");
    sockets.push(ws);

    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());

    // Blockchain query한 다음, 일정시간 이후 transaction pool query
    setTimeout(()=>{
        broadcast(queryTransactionPoolMsg());
    }, 500)
};

const JSONToObject = <T>(data: string): T => {
    try {
        return JSON.parse(data);
    } catch (err: any) {
        console.log(err);
        return err;
    }
};

const initMessageHandler = (ws: WebSocket) => {
    console.log("initMessageHandler");
    ws.on("message", (data: string) => {
        try {
            const message: Message = JSONToObject<Message>(data);
            if (message === null) {
                console.log("could not parse received JSON message: " + data);
                return;
            }
            console.log("Received message: %s", JSON.stringify(message));
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    write(ws, responseLatestMsg());
                    break;
                case MessageType.QUERY_ALL:
                    write(ws, responseChainMsg());
                    break;
                case MessageType.RESPONSE_BLOCKCHAIN:
                    const receivedBlocks: Block[] = JSONToObject<Block[]>(
                        message.data
                    );
                    if (receivedBlocks === null) {
                        console.log(
                            "invalid blocks received: %s",
                            JSON.stringify(message.data)
                        );
                        break;
                    }
                    handleBlockchainResponse(receivedBlocks);
                    break;
                case MessageType.QUERY_TRANSACTION_POOL:
                    write(ws, responseTransactionPoolMsg());
                    break;
                case MessageType.RESPONSE_TRANSACTION_POOL:
                    const receivedTransactions: Transaction[] = JSONToObject<Transaction[]>(message.data);
                    if (receivedTransactions == null) {
                        console.log("Invalid transaction received: ", JSON.stringify(message.data));
                        break;
                    }
                    receivedTransactions.forEach((transaction: Transaction) => {
                        try {
                            Blockchain.handleReceivedTransaction(transaction, unspentTxOuts, transactionPool);
                            broadcastTransctionPool();
                        } catch (error) {
                            console.log(error);
                        }
                    })
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    });
};

const write = (ws: WebSocket, message: Message): void =>
    ws.send(JSON.stringify(message));
const broadcast = (message: Message): void =>
    sockets.forEach((socket) => write(socket, message));

const queryChainLengthMsg = (): Message => ({
    type: MessageType.QUERY_LATEST,
    data: null,
});

const queryAllMsg = (): Message => ({
    type: MessageType.QUERY_ALL,
    data: null,
});

const responseChainMsg = (): Message => ({
    type: MessageType.RESPONSE_BLOCKCHAIN,
    data: JSON.stringify(blockchain.chain),
});

const responseLatestMsg = (): Message => ({
    type: MessageType.RESPONSE_BLOCKCHAIN,
    data: JSON.stringify([blockchain.getLastBlock()]),
});

// transaction pool을 위한 통신
const queryTransactionPoolMsg = (): Message => ({
	type: MessageType.QUERY_TRANSACTION_POOL,
	data: null,
});
const responseTransactionPoolMsg = (): Message => ({
	type: MessageType.RESPONSE_TRANSACTION_POOL,
	data: JSON.stringify(transactionPool),
});


const initErrorHandler = (ws: WebSocket) => {
    const closeConnection = (myWs: WebSocket) => {
        console.log("connection failed to peer: " + myWs.url);
        sockets.splice(sockets.indexOf(myWs), 1);
    };
    ws.on("close", () => closeConnection(ws));
    ws.on("error", () => closeConnection(ws));
};

const handleBlockchainResponse = (receivedBlocks: Block[]) => {
    if (receivedBlocks.length === 0) {
        console.log("received block chain size of 0");
        return;
    }
    const latestBlockReceived: Block =
        receivedBlocks[receivedBlocks.length - 1];
    if (!Blockchain.isValidBlockStructure(latestBlockReceived)) {
        console.log("block structuture not valid");
        return;
    }
    const latestBlockHeld: Block = blockchain.getLastBlock();
    if (latestBlockReceived.header.index > latestBlockHeld.header.index) {
        console.log(
            "blockchain possibly behind. We got: " +
                latestBlockHeld.header.index +
                " Peer got: " +
                latestBlockReceived.header.index
        );
        if (latestBlockHeld.hash === latestBlockReceived.header.prevHash) {
            if (blockchain.addBlock(latestBlockReceived.data)) {
                broadcast(responseLatestMsg());
            }
        } else if (receivedBlocks.length === 1) {
            console.log("We have to query the chain from our peer");
            broadcast(queryAllMsg());
        } else {
            console.log(
                "Received blockchain is longer than current blockchain"
            );
            blockchain.replaceChain(receivedBlocks);
            Blockchain.setUnspentTxOuts(unspentTxOuts, Blockchain.newBlockUnspentTxOuts(receivedBlocks));
            TransactionPool.updateTransactionPool(unspentTxOuts, transactionPool)
            broadcast(responseLatestMsg());
        }
    } else {
        console.log(
            "received blockchain is not longer than received blockchain. Do nothing"
        );
    }
};

const broadcastLatest = (): void => {
    broadcast(responseLatestMsg());
};

const connectToPeers = (newPeers: string[]): void => {
    newPeers.forEach((peer) => {
        const ws = new WebSocket(peer);
        ws.on("open", () => {
            console.log("connection open");
            initConnection(ws);
        });
        ws.on("error", (error) => {
            console.log(error);
            console.log("connection Failed!");
        });
    });
};

const broadcastTransctionPool = () => {
	broadcast(responseTransactionPoolMsg());
}

export { connectToPeers, broadcastLatest, broadcastTransctionPool, initP2PServer, getSockets };
