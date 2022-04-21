/**
 * Transaction Pool
 * - Unconfirmed transaction들을 담아두는 곳
 * - bitcoin에서는 Mempool 이라고도 부른다.
 */

import _, { isNaN } from "lodash";
import {
    Transaction,
    TxIn,
    UnspentTxOut,
    TxFunctions,
} from "../transaction/transaction";

class TransactionPool {
    static getTransactionPool = (transactionPool: Transaction[]) => {
        return _.cloneDeep(transactionPool);
    };

    /**
     * addToTransactionPool
     * - transaction에 대한 검증 후 transaction pool에 추가
     * @param tx
     * @param unspentTxOuts
     */
    static addToTransactionPool = (
        tx: Transaction,
        unspentTxOuts: UnspentTxOut[],
        transactionPool: Transaction[]
    ) => {
        if (!TxFunctions.validateTransaction(tx, unspentTxOuts)) {
            throw Error("You are trying to add invalid tx to transaction pool");
        }

        if (!this.isValidTxForPool(tx, transactionPool)) {
            throw Error("You are trying to add invalid tx to transaction pool");
        }
        if (!TxFunctions.isValidTransactionStructure(tx)) {
            throw Error("You are trying to add invalid tx to transaction pool");
        }
        if (
            tx.txOuts[0].address === "" ||
            tx.txOuts[0].address.length !== 130
        ) {
            throw Error("Invalid txOut address");
        }
        if (tx.txOuts[0].amount === 0 || isNaN(tx.txOuts[0].amount)) {
            throw Error("Invalid txOut amount");
        }

        console.log("Successfully added to pool, tx: ", JSON.stringify(tx));
        transactionPool.push(tx);
    };

    /**
     * hasTxIn
     * - txIn이 UTXO에 있는지 확인
     * @param txIn
     * @param unspentTxOuts
     * @returns boolean
     */
    static hasTxIn = (txIn: TxIn, unspentTxOuts: UnspentTxOut[]): boolean => {
        const foundTxIn = unspentTxOuts.find(
            (utxo: UnspentTxOut) =>
                utxo.txOutId === txIn.txOutId &&
                utxo.txOutIndex === txIn.txOutIndex
        );
        return foundTxIn !== undefined;
    };

    /**
     * updateTransactionPool
     * - 새로운 블록에 추가된 trasaction들을 transaction Pool에서 제거
     * @param unspentTxOuts 새롭게 갱신된 utxos
     */
    static updateTransactionPool = (
        unspentTxOuts: UnspentTxOut[] | null,
        transactionPool: Transaction[]
    ) => {
        // Transaction Pool에 있는 트랜잭션 중 txIns의 내용이
        // 새로 갱신된 UTXO에서 온게 아니라면
        // Transaction Pool 에서 제거
        if (unspentTxOuts == null) {
            throw Error("Invalid unspentTxOuts");
        }
        const invalidTxs = [];
        for (const tx of transactionPool) {
            for (const txIn of tx.txIns) {
                if (!this.hasTxIn(txIn, unspentTxOuts)) {
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
    };

    /**
     * getTxPoolIns
     * - 해당 transaction Pool에 있는 모든 Tx Input을 배열로 반환
     * @param aTransactionPool
     * @returns txIns
     */
    static getTxPoolIns = (aTransactionPool: Transaction[]): TxIn[] => {
        return _(aTransactionPool)
            .map((tx) => tx.txIns)
            .flatten()
            .value();
    };

    /**
     * isValidTxForPool
     * - 추가될 tx의 txIns가 transactionPool에 없어야 함
     * @param tx
     * @param aTransactionPool
     * @returns
     */
    static isValidTxForPool = (
        tx: Transaction,
        aTransactionPool: Transaction[]
    ): boolean => {
        const txPoolIns: TxIn[] = this.getTxPoolIns(aTransactionPool);

        const containsTxIn = (txIns: TxIn[], txIn: TxIn) =>
            _.find(
                txPoolIns,
                (txPoolIns) =>
                    txIn.txOutId === txPoolIns.txOutId &&
                    txIn.txOutIndex === txPoolIns.txOutIndex
            );

        for (const txIn of tx.txIns) {
            if (containsTxIn(txPoolIns, txIn)) {
                console.log("txIn already found in the transaction pool");
                console.log(txIn.txOutId);
                console.log(txIn.txOutIndex);

                return false;
            }
        }
        return true;
    };
}

export { TransactionPool };
