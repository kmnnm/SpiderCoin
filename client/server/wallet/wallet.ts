import { ec } from "elliptic";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import _ from "lodash";
import {
    TxFunctions,
    Transaction,
    TxIn,
    TxOut,
    UnspentTxOut,
} from "../transaction/transaction";

const EC = new ec("secp256k1");
const privateKeyLocation = process.env.PRIVATE_KEY || "node/wallet/private_key";

const getPrivateFromWallet = (): string => {
    const buffer = readFileSync(privateKeyLocation, "utf8");
    return buffer.toString();
};

const getPublicFromWallet = (): string => {
    const privateKey = getPrivateFromWallet();
    const key = EC.keyFromPrivate(privateKey, "hex");
    return key.getPublic().encode("hex", false);
};

const generatePrivateKey = (): string => {
    const keyPair = EC.genKeyPair();
    const privateKey = keyPair.getPrivate();
    return privateKey.toString(16);
};

const generatePeerWallet = (): string[] => {
    const privateKey = generatePrivateKey();
    const key = EC.keyFromPrivate(privateKey, "hex");
    const publicKey = key.getPublic().encode("hex", false);

    return [privateKey, publicKey]
}

const initWallet = () => {
    if (existsSync(privateKeyLocation)) {
        return;
    }
    const newPrivateKey = generatePrivateKey();

    writeFileSync(privateKeyLocation, newPrivateKey);
    console.log(
        "new wallet with private key created to : %s",
        privateKeyLocation
    );
};

const deleteWallet = () => {
    if (existsSync(privateKeyLocation)) {
        unlinkSync(privateKeyLocation);
    }
};

const getBalance = (address: string, unspentTxOuts: UnspentTxOut[]): number => {
    return _(findUnspentTxOuts(address, unspentTxOuts))
        .map((uTxO: UnspentTxOut) => uTxO.amount)
        .sum();
};

const findUnspentTxOuts = (
    ownerAddress: string,
    unspentTxOuts: UnspentTxOut[]
) => {
    return _.filter(
        unspentTxOuts,
        (uTxO: UnspentTxOut) => uTxO.address === ownerAddress
    );
};

const findTxOutsForAmount = (
    amount: number,
    myUnspentTxOuts: UnspentTxOut[]
) => {
    let currentAmount = 0;
    const includedUnspentTxOuts = [];
    for (const myUnspentTxOut of myUnspentTxOuts) {
        includedUnspentTxOuts.push(myUnspentTxOut);
        currentAmount = currentAmount + myUnspentTxOut.amount;
        if (currentAmount >= amount) {
            const leftOverAmount = currentAmount - amount;
            return { includedUnspentTxOuts, leftOverAmount };
        }
    }

    const eMsg =
        "Cannot create transaction from the available unspent transaction outputs." +
        " Required amount:" +
        amount +
        ". Available unspentTxOuts:" +
        JSON.stringify(myUnspentTxOuts);
    throw Error(eMsg);
};

const createTxOuts = (
    receiverAddress: string,
    myAddress: string,
    amount: any,
    leftOverAmount: number
) => {
    const txOut1: TxOut = new TxOut(receiverAddress, amount);
    if (leftOverAmount === 0) {
        return [txOut1];
    } else {
        const leftOverTx = new TxOut(myAddress, leftOverAmount);
        return [txOut1, leftOverTx];
    }
};

const filterTxPoolTxs = (
    unspentTxOuts: UnspentTxOut[],
    transactionPool: Transaction[]
): UnspentTxOut[] => {
    const txIns: TxIn[] = _(transactionPool)
        .map((tx: Transaction) => tx.txIns)
        .flatten()
        .value();
    const removable: UnspentTxOut[] = [];
    for (const unspentTxOut of unspentTxOuts) {
        const txIn = _.find(txIns, (aTxIn: TxIn) => {
            return (
                aTxIn.txOutIndex === unspentTxOut.txOutIndex &&
                aTxIn.txOutId === unspentTxOut.txOutId
            );
        });

        if (txIn === undefined) {
        } else {
            removable.push(unspentTxOut);
        }
    }

    return _.without(unspentTxOuts, ...removable);
};

const createTransaction = (
    receiverAddress: string,
    amount: number,
    privateKey: string,
    unspentTxOuts: UnspentTxOut[],
    txPool: Transaction[]
): Transaction => {
    console.log("txPool: %s", JSON.stringify(txPool));

    const myAddress: string = TxFunctions.getPublicKey(privateKey);

    const myUnspentTxOutsA = unspentTxOuts.filter(
        (uTxO: UnspentTxOut) => uTxO.address === myAddress
    );

    const myUnspentTxOuts = filterTxPoolTxs(myUnspentTxOutsA, txPool);

    // filter from unspentOutputs such inputs that are referenced in pool
    const { includedUnspentTxOuts, leftOverAmount } = findTxOutsForAmount(
        amount,
        myUnspentTxOuts
    );

    const toUnsignedTxIn = (unspentTxOut: UnspentTxOut) => {
        const txIn: TxIn = new TxIn();
        txIn.txOutId = unspentTxOut.txOutId;
        txIn.txOutIndex = unspentTxOut.txOutIndex;
        return txIn;
    };

    const unsignedTxIns: TxIn[] = includedUnspentTxOuts.map(toUnsignedTxIn);

    const tx: Transaction = new Transaction();
    tx.txIns = unsignedTxIns;
    tx.txOuts = createTxOuts(
        receiverAddress,
        myAddress,
        amount,
        leftOverAmount
    );
    tx.id = TxFunctions.getTransactionId(tx);

    tx.txIns = tx.txIns.map((txIn: TxIn, index: number) => {
        txIn.signature = TxFunctions.signTxIn(
            tx,
            index,
            privateKey,
            unspentTxOuts
        );
        return txIn;
    });

    return tx;
};

const createTransaction2 = (
    receiverAddress: string,
    amount: number,
    privateKey: string,
    unspentTxOuts: UnspentTxOut[],
    txPool: Transaction[],
    myAddr: string
): Transaction => {
    console.log("txPool: %s", JSON.stringify(txPool));

    const myAddress: string = myAddr;

    const myUnspentTxOutsA = unspentTxOuts.filter(
        (uTxO: UnspentTxOut) => uTxO.address === myAddress
    );

    const myUnspentTxOuts = filterTxPoolTxs(myUnspentTxOutsA, txPool);
    console.log("내 UTXO : ", myUnspentTxOuts);

    // filter from unspentOutputs such inputs that are referenced in pool
    const { includedUnspentTxOuts, leftOverAmount } = findTxOutsForAmount(
        amount,
        myUnspentTxOuts
    );

    const toUnsignedTxIn = (unspentTxOut: UnspentTxOut) => {
        const txIn: TxIn = new TxIn();
        txIn.txOutId = unspentTxOut.txOutId;
        txIn.txOutIndex = unspentTxOut.txOutIndex;
        return txIn;
    };

    const unsignedTxIns: TxIn[] = includedUnspentTxOuts.map(toUnsignedTxIn);

    const tx: Transaction = new Transaction();
    tx.txIns = unsignedTxIns;
    tx.txOuts = createTxOuts(
        receiverAddress,
        myAddress,
        amount,
        leftOverAmount
    );
    tx.id = TxFunctions.getTransactionId(tx);

    tx.txIns = tx.txIns.map((txIn: TxIn, index: number) => {
        txIn.signature = TxFunctions.signTxIn(
            tx,
            index,
            privateKey,
            unspentTxOuts
        );
        return txIn;
    });

    return tx;
};

export {
    createTransaction,
    createTransaction2,
    getPublicFromWallet,
    getPrivateFromWallet,
    getBalance,
    generatePrivateKey,
    initWallet,
    deleteWallet,
    findUnspentTxOuts,
};
