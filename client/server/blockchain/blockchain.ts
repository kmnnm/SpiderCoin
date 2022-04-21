import merkle = require("merkle");
import Block from "./block";
import * as config from "../config";
import {
    Transaction,
    TxFunctions,
    UnspentTxOut,
} from "../transaction/transaction";
import {
    createTransaction,
    createTransaction2,
    findUnspentTxOuts,
    getBalance,
    getPrivateFromWallet,
    getPublicFromWallet,
} from "../wallet/wallet";
import _ = require("lodash");
import { TransactionPool } from "../transactionPool/transactionPool";

export default class Blockchain {
    chain: Block[];

    constructor() {
        this.chain = [Block.getGenesisBlock()];
    }

    getLastBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    addBlock(data: Transaction[]) {
        const newBlock: Block = Block.mineNewBlock(
            this.chain[this.chain.length - 1],
            data
        );
        const lastBlock: Block = this.getLastBlock();
        if (Blockchain.isValidNewBlock(newBlock, lastBlock))
            this.chain.push(newBlock);
        return newBlock;
    }

    static isValidBlockStructure(block: Block) {
        return (
            typeof block.header.version === "string" &&
            typeof block.header.index === "number" &&
            typeof block.header.prevHash === "string" &&
            typeof block.header.merkleRoot === "string" &&
            typeof block.header.timestamp === "number" &&
            typeof block.header.difficulty === "number" &&
            typeof block.header.nonce === "number" &&
            typeof block.data === "object" &&
            typeof block.hash === "string"
        );
    }

    static isValidNewBlock(newBlock: Block, lastBlock: Block): boolean {
        /**
         * Validate
         *  1. block structure
         *  2. index
         *  3. prevHash
         *  4. merkleRoot
         *  5. timestamp
         *  6. difficulty
         */
        if (!this.isValidBlockStructure(newBlock)) {
            console.log("Invalid Block structure");
            return false;
        } else if (newBlock.header.index !== lastBlock.header.index + 1) {
            console.log("Invalid index");
            return false;
        } else if (newBlock.header.prevHash !== lastBlock.hash) {
            console.log("Invalid prevHash");
            return false;
        } else if (
            (newBlock.data.length === 0 &&
                newBlock.header.merkleRoot !== "0".repeat(64)) ||
            (newBlock.data.length !== 0 &&
                newBlock.header.merkleRoot !==
                    merkle("sha256")
                        .sync([JSON.stringify(newBlock.data)])
                        .root())
        ) {
            console.log("Invalid merkleRoot");
            return false;
        } else if (newBlock.header.timestamp < lastBlock.header.timestamp) {
            console.log("Invalid timestamp");
            return false;
        } else if (
            !newBlock.hash.startsWith("0".repeat(newBlock.header.difficulty))
        ) {
            console.log("Invalid difficulty");
            return false;
        }
        return true;
    }

    static isValidChain(blocks: Block[]): boolean {
        if (
            JSON.stringify(blocks[0]) !==
            JSON.stringify(Block.getGenesisBlock())
        ) {
            return false;
        }
        let aUnspentTxOuts: UnspentTxOut[] | null = [];
        for (let i = 1; i < blocks.length; i++) {
            const currentBlock: Block = blocks[i];
            const prevBlock: Block = blocks[i - 1];
            if (!this.isValidNewBlock(currentBlock, prevBlock)) {
                return false;
            }
            aUnspentTxOuts = TxFunctions.processTransactions(
                currentBlock.data,
                aUnspentTxOuts,
                currentBlock.header.index
            );
            if (aUnspentTxOuts === null) {
                console.log("Invalid transactions in blockchain");
                return false;
            }
        }
        return true;
    }

    static newBlocksUTXOs(blocks: Block[]) {
        if (
            JSON.stringify(blocks[0]) !==
            JSON.stringify(Block.getGenesisBlock())
        ) {
            return null;
        }
        let aUnspentTxOuts: UnspentTxOut[] | null = [];
        for (let i = 1; i < blocks.length; i++) {
            const currentBlock: Block = blocks[i];
            const prevBlock: Block = blocks[i - 1];
            if (!this.isValidNewBlock(currentBlock, prevBlock)) {
                return null;
            }
            aUnspentTxOuts = TxFunctions.processTransactions(
                currentBlock.data,
                aUnspentTxOuts,
                currentBlock.header.index
            );
            console.log(123123123123);
            
            if (aUnspentTxOuts === null) {
                console.log("Invalid transactions in blockchain");
                return null;
            }
        }
        return aUnspentTxOuts;
    }

    static newBlockUnspentTxOuts = (blocks: Block[]): UnspentTxOut[] | null => {
        let aUnspentTxOuts: UnspentTxOut[] | null = [];
        for (let i = 1; i < blocks.length; i++) {
            const currentBlock: Block = blocks[i];
            const prevBlock: Block = blocks[i - 1];

            aUnspentTxOuts = TxFunctions.processTransactions(
                currentBlock.data,
                aUnspentTxOuts,
                currentBlock.header.index
            );
            if (aUnspentTxOuts === null) {
                console.log("Invalid transactions in blockchain");
                return null;
            }
        }
        return aUnspentTxOuts;
    };

    static getAccumulatedDifficulty = (aBlockchain: Block[]): number => {
        return (
            aBlockchain
                .map((block) => block.header.difficulty)
                // .map((difficulty) => Math.pow(2, difficulty))
                .reduce((a, b) => a + b)
        );
    };

    replaceChain(newBlocks: Block[]): boolean {
        const aUnspentTxOuts = Blockchain.newBlocksUTXOs(newBlocks);
        const validChain: boolean = aUnspentTxOuts !== null;
        if (
            validChain &&
            Blockchain.getAccumulatedDifficulty(newBlocks) >
                Blockchain.getAccumulatedDifficulty(this.chain)
        )
            this.chain = newBlocks;
        console.log("Replace current chain with new one");
        return true;
    }

    static getBlockData = (
        receiverAddress: string,
        blockchain: Blockchain,
        transactionPool: Transaction[]
    ) => {
        if (!TxFunctions.isValidAddress(receiverAddress)) {
            throw Error("Invalid address");
        }
        const coinbaseTx: Transaction = TxFunctions.getCoinbaseTransaction(
            receiverAddress,
            blockchain.getLastBlock().header.index + 1
        );
        const transactions: Transaction[] = transactionPool;
        const blockData: Transaction[] = [coinbaseTx].concat(transactions);
        return blockData;
    };

    static getUnspentTxOuts = (unspentTxOuts: UnspentTxOut[]) =>
        _.cloneDeep(unspentTxOuts);
    static setUnspentTxOuts = (
        unspentTxOuts: UnspentTxOut[] | null,
        newUnspentTxOuts: UnspentTxOut[] | null
    ) => {
        if (unspentTxOuts !== null && newUnspentTxOuts !== null) {
            console.log("Replacing unspentTxOuts with ");
            console.log(newUnspentTxOuts);

            unspentTxOuts = newUnspentTxOuts;
        } else {
            throw Error("Invalid unspentTxOuts or newUnspentTxOuts.");
        }
    };

    static getMyUnspentTxOutputs = (unspentTxOuts: UnspentTxOut[]) => {
        return findUnspentTxOuts(getPublicFromWallet(), unspentTxOuts);
    };

    static sendTransaction = (
        address: string,
        amount: number,
        privateKey: string,
        unspentTxOuts: UnspentTxOut[],
        transactionPool: Transaction[]
    ): Transaction => {
        const tx: Transaction = createTransaction(
            address,
            amount,
            privateKey,
            unspentTxOuts,
            transactionPool
        );
        TransactionPool.addToTransactionPool(
            tx,
            unspentTxOuts,
            transactionPool
        );
        return tx;
    };

    static p2pSendTransaction = (
        address: string,
        amount: number,
        privateKey: string,
        unspentTxOuts: UnspentTxOut[],
        transactionPool: Transaction[],
        myAddress: string
    ): Transaction => {
        const tx: Transaction = createTransaction2(
            address,
            amount,
            privateKey,
            unspentTxOuts,
            transactionPool,
            myAddress
        );
        TransactionPool.addToTransactionPool(
            tx,
            unspentTxOuts,
            transactionPool
        );
        return tx;
    };

    static handleReceivedTransaction = (
        transaction: Transaction,
        unspentTxOuts: UnspentTxOut[] | null,
        transactionPool: Transaction[]
    ) => {
        if (unspentTxOuts === null) throw Error("Invalid unspentTxOuts");
        TransactionPool.addToTransactionPool(
            transaction,
            Blockchain.getUnspentTxOuts(unspentTxOuts),
            transactionPool
        );
    };
}
