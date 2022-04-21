import fs = require("fs");
import merkle = require("merkle");
import cryptojs = require("crypto-js");

import * as config from "../config";
import { Transaction } from "../transaction/transaction";

class BlockHeader {
    public version: string;
    public index: number;
    public prevHash: string;
    public merkleRoot: string;
    public timestamp: number;
    public difficulty: number;
    public nonce: number;

    constructor(
        version: string,
        index: number,
        prevHash: string,
        merkleRoot: string,
        timestamp: number,
        difficulty: number,
        nonce: number
    ) {
        this.version = version;
        this.index = index;
        this.prevHash = prevHash;
        this.merkleRoot = merkleRoot;
        this.timestamp = timestamp;
        this.difficulty = difficulty;
        this.nonce = nonce;
    }
}

const genesisTransaction: Transaction = {
    txIns: [{'signature': '', 'txOutId': '', 'txOutIndex': 0}],
    txOuts: [{
        'address': '04875a5ee53110a1ce856f2fc549671456afcc62a510d96cb8e05ca0cb65f78c0b1fb880db8ac195cee93d2d6eff917e795f224d63a2c73319b1ce1e42f27395a4',
        'amount': 50
    }],
    id: 'ff21efb83712a97c5bab8babbf5e7e6b3af9fce90aae1fcf5dbe45e753e594ba'
};

export default class Block {
    public header: BlockHeader;
    public hash: string;
    public data: Transaction[];

    constructor(header: BlockHeader, hash: string, data: Transaction[]) {
        this.header = header;
        this.hash = hash;
        this.data = data;
    }

    static getVersion(): string {
        const packagejson: string = fs.readFileSync("package.json", "utf8");
        const version: string = JSON.parse(packagejson).version;
        return version;
    }

    static getGenesisBlock(): Block {
        const data: Transaction[] = [genesisTransaction];
        const header = new BlockHeader(
            "0.1.0",
            0,
            "0".repeat(64),
            merkle("sha256")
                .sync([JSON.stringify(data)])
                .root() || "0".repeat(64),
            1631006505,
            config.INITIAL_DIFFICULTY,
            0
        );
        const hash = this.calHashOfBlock(header);
        const genesisBlock = new Block(header, hash, data);
        return genesisBlock;
    }

    static mineNewBlock(lastBlock: Block, data: Transaction[]): Block {
        const version = lastBlock.header.version;
        const index = lastBlock.header.index + 1;
        const prevHash: string = lastBlock.hash;
        let merkleRoot = data.length
					? merkle("sha256")
							.sync([JSON.stringify(data)])
							.root()
					: "0".repeat(64);
        let timestamp: number = Math.round(Date.now() / 1000);
        let difficulty = this.adjustDifficulty(lastBlock, timestamp);
        let nonce: number = 0;
        let blockHeader: BlockHeader;
        let hash: string;
        do {
            timestamp = Math.round(Date.now() / 1000);
            blockHeader = new BlockHeader(
                version,
                index,
                prevHash,
                merkleRoot,
                timestamp,
                difficulty,
                nonce
            );
            hash = this.calHashOfBlock(blockHeader);
            nonce++;
        } while (!hash.startsWith("0".repeat(difficulty)));
        return new Block(blockHeader, hash, data);
    }

    static calHashOfBlock(blockHeader: BlockHeader) {
        if (typeof blockHeader === "object") {
            const blockString: string =
                blockHeader.version +
                blockHeader.index +
                blockHeader.prevHash +
                blockHeader.merkleRoot +
                blockHeader.timestamp +
                blockHeader.difficulty +
                blockHeader.nonce;
            const hash = cryptojs.SHA256(blockString).toString();
            return hash;
        }
        console.log("Invalid BlockHeader");
        return "null";
    }

    static adjustDifficulty(lastBlock: Block, newBlockTime: number): number {
        let difficulty: number = lastBlock.header.difficulty;
        const newBlockInterval: number =
            newBlockTime - lastBlock.header.timestamp;
        if (
            lastBlock.header.index % config.BLOCK_GENERATION_INTERVAL === 0 &&
            lastBlock.header.index !== 0
        ) {
            if (newBlockInterval > config.MINE_INTERVAL * 2) {
                return difficulty - 1;
            } else if (newBlockInterval < config.MINE_INTERVAL / 2) {
                return difficulty + 1;
            }
        }
        return difficulty;
    }
}

export { Block, BlockHeader };
