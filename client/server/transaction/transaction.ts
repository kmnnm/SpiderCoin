import cryptojs = require("crypto-js");
import _ from "lodash";
import ecdsa = require("elliptic");

const ec = new ecdsa.ec("secp256k1");

/**
 * transaction input은 항상 UnspentTxOutput에서 가져온다.
 * coinbase transaction 특징
 * - 오직 output만 포함한다.(인풋이 없다.)
 * - 새로운 코인을 추가할 때 사용된다.(채굴 보상?)
 * - 블록의 첫번째 transaction 이며, miner의 정보가 포함되어 있다.
 */
const COINBASE_AMOUNT: number = 50;

/**
 * UnspentTxOut : UTXO; Unspent Transaction Output
 * - transaction 이후 남은 수량을 가지고 있는 transaction Output
 * - 다음 블록에서 input으로 사용 가능함
 * - 일부분만 따로 사용할 수는 없고 전체 수량을 사용해야함 => 트랜잭션 후 남은 금액은 다시 내 지갑 주소로 들어감
 */
class UnspentTxOut {
    public readonly txOutId: string;
    public readonly txOutIndex: number;
    public readonly address: string;
    public readonly amount: number;

    constructor(
        txOutId: string,
        txOutIndex: number,
        address: string,
        amount: number
    ) {
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
        this.address = address;
        this.amount = amount;
    }
}

/**
 * TxOut : Transaction Output
 * - 보낼 coin의 amount와 보낼 지갑의 address를 포함
 */
class TxOut {
    public address: string;
    public amount: number;

    constructor(address: string, amount: number) {
        this.address = address;
        this.amount = amount;
    }
}

/**
 * Txin : Transaction Input
 * - 무조건 Transaction Output을 참조!
 * - private key를 통한 signature가 들어감
 */
class TxIn {
    public txOutId: string;
    public txOutIndex: number;
    public signature: string;
}

/**
 * Transaction
 * - input 리스트와 output 리스트를 포함
 * - 모든 input, output의 요소를 토대로 계산된 hash값(signature 제외)
 */
class Transaction {
    public id: string;
    public txIns: TxIn[];
    public txOuts: TxOut[];
}

class TxFunctions {
    /**
     * getTransactionId
     * : transaction 안의 내용을 다 더한 후 hash 계산.
     * (signature는 hash 계산에 포함되지 않음)
     * @param transaction target Transaction
     * @returns string
     */
    static getTransactionId = (transaction: Transaction): string => {
        const txInContent: string = transaction.txIns
            // TxIn안의 내용을 다 더함
            .map((txIn: TxIn) => txIn.txOutId + txIn.txOutIndex)
            // 다 더한 TxIn들을 다시 다 더함
            .reduce((a, b) => a + b, "");

        const txOutContent: string = transaction.txOuts
            // TxOut안의 내용을 다 더함
            .map((txOut: TxOut) => txOut.address + txOut.amount)
            // 다 더한 TxOut들을 다시 다 더함
            .reduce((a, b) => a + b, "");

        return cryptojs.SHA256(txInContent + txOutContent).toString();
    };

    /**
     * validateTransaction
     * 1. transaction id 검증
     * 2. transaction inputs 검증
     * 3. transaction inputs의 총합과 outputs의 총합이 같은지 비교
     * @param transaction Transaction to validate
     * @param aUnspentTxOuts for comparing to transaction inputs
     * @returns boolean
     */
    static validateTransaction = (
        transaction: Transaction,
        aUnspentTxOuts: UnspentTxOut[]
    ): boolean => {
        // transaction id를 직접 계산한 값과 비교
        if (this.getTransactionId(transaction) !== transaction.id) {
            console.log("Invalid tx id: ", transaction.id);
            return false;
        }

        // txIns 안의 txIn들 검증
        const hasValidTxIns: boolean = transaction.txIns
            .map((txIn) => this.validateTxIn(txIn, transaction, aUnspentTxOuts))
            .reduce((a, b) => a && b, true);

        if (!hasValidTxIns) {
            console.log("Invalid txIn found: ", transaction.id);
            return false;
        }

        // txIn 값의 합
        const totalTxInValues: number = transaction.txIns
            .map((txIn) => this.getTxInAmount(txIn, aUnspentTxOuts))
            .reduce((a, b) => a + b, 0);

        // txOut 값의 합
        const totalTxOutValues: number = transaction.txOuts
            .map((txOut) => txOut.amount)
            .reduce((a, b) => a + b, 0);

        // input 값의 총합과 output 값의 총합이 같아야함
        if (totalTxInValues !== totalTxOutValues) {
            console.log(
                "totalTxInValues !== totalTxOutValues in tx: " + transaction.id
            );
            return false;
        }

        return true;
    };

    /**
     * validateBlockTransactions
     * : 블록 내 트랜잭션 검증
     * 1. first transaction === coinbase transaction
     * 2. transaction 중복 검사
     * 3. coinbase transaction을 제외한 나머지 일반 transaction 검증
     * @param aTransactions
     * @param aUnspentTxOuts
     * @param blockIndex
     * @returns boolean
     */
    static validateBlockTransactions = (
        aTransactions: Transaction[],
        aUnspentTxOuts: UnspentTxOut[],
        blockIndex: number
    ): boolean => {
        // 첫 transaction이 coinbase transaction인지 확인
        const coinbaseTx = aTransactions[0];
        if (!this.validateCoinbaseTx(coinbaseTx, blockIndex)) {
            return false;
        }

        // 중복된 transaction이 있는지 검증
        const txIns: TxIn[] = _(aTransactions)
            .map((tx) => tx.txIns)
            .flatten()
            .value();

        if (this.hasDuplicates(txIns)) {
            return false;
        }

        // coinbase transaction을 제외한 나머지 트랜잭션들
        const normalTransactions: Transaction[] = aTransactions.slice(1);
        return normalTransactions
            .map((tx) => this.validateTransaction(tx, aUnspentTxOuts))
            .reduce((a, b) => a && b, true);
    };

    /**
     * hasDuplicates
     * : 블록 내 transaction 중복 검사
     * @param txIns
     * @returns
     */
    static hasDuplicates = (txIns: TxIn[]): boolean => {
        // _.countBy(collection, [iteratee=_.identity]) : 배열 또는 객체에서 요소의 반복 횟수를 object 형식으로 반환
        const groups = _.countBy(txIns, (txIn) => txIn.txOutId + txIn.txOutIndex);
        return (
            _(groups)
                .map((value, key) => {
                    if (value > 1) {
                        console.log("Duplicate txIn: " + key);
                        return true;
                    } else {
                        return false;
                    }
                })
                // collection.includes(value, [fromIndex=0])
                .includes(true)
        );
    };

    /**
     * validateCoinbaseTx
     * : coinbase transaction 검증 (validateTransaction와 뭐가 다른지 알아두자)
     * 1. 모든 블록에 coinbase transaction가 존재해야 함
     * 2. transaction id 검증
     * 3. 블록 당 coinbase transaction은 단 하나만 존재해야 함
     * 4. coinbase transaction의 amount는 정해진 양으로 동일하다.
     * @param transaction
     * @param blockIndex
     * @returns
     */
    static validateCoinbaseTx = (
        transaction: Transaction,
        blockIndex: number
    ): boolean => {
        // coinbase transaction이 없으면 안됨
        if (transaction == null) {
            console.log(
                "The first transaction in the block must be coinbase transaction"
            );
            return false;
        }

        // transaction id와 계산한 값을 비교
        if (this.getTransactionId(transaction) !== transaction.id) {
            console.log("Invalid coinbase tx id: " + transaction.id);
            return false;
        }

        // conibase transaction은 길이가 1이여야 함(오로지 하나만 존재)
        if (transaction.txIns.length !== 1) {
            console.log(
                "One txIn must be specified in the coinbase transaction"
            );
            return false;
        }

        // coinbase transaction에는 매번 동일하게 정해진 amount로 생성돼야 함.
        if (transaction.txOuts[0].amount !== COINBASE_AMOUNT) {
            console.log("Invalid coinbase amount in coinbase transaction");
            return false;
        }

        return true;
    };

    /**
     * validateTxIn
     * 1. transaction inputs가 UnspentTxOuts를 참조했는지 비교
     * 2. sigature 검증
     * @param txIn
     * @param transaction
     * @param aUnspentTxOuts
     * @returns boolean
     */
    static validateTxIn = (
        txIn: TxIn,
        transaction: Transaction,
        aUnspentTxOuts: UnspentTxOut[]
    ): boolean => {
        // txIn이 unspentTxOut에서 참조하고 있는지 확인
        const referencedUnspentTxOut: UnspentTxOut | undefined =
            aUnspentTxOuts.find(
                (UnspentTxOut) =>
                    UnspentTxOut.txOutId === txIn.txOutId &&
                    UnspentTxOut.txOutIndex === txIn.txOutIndex
            );
        if (referencedUnspentTxOut == undefined) {
            console.log("Referenced txOut not found: ");
            return false;
        }
        const address = referencedUnspentTxOut.address;

        // public key를 이용해서 signature 검증
        const key = ec.keyFromPublic(address, "hex");
        return key.verify(transaction.id, txIn.signature);
    };

    /**
     * getTxInAmount
     * : UnspentTxOutput에서 참조한 amount 출력
     * (UTXO에 없으면 0 반환)
     * @param txIn
     * @param aUnspentTxOuts
     * @returns number (If undefined tx, return 0. Otherwise, return amount from UnspentTxOut)
     */
    static getTxInAmount = (
        txIn: TxIn,
        aUnspentTxOuts: UnspentTxOut[]
    ): number => {
        const utxo = this.findUnspentTxOut(
            txIn.txOutId,
            txIn.txOutIndex,
            aUnspentTxOuts
        );
        if (utxo === undefined) {
            return 0;
        }
        return utxo.amount;
    };

    /**
     * findUnspentTxOut
     * : UTXO에서 옵션에 해당하는 tx 찾아서 반환
     * @param aTxOutId
     * @param aTxOutIndex
     * @param aUnspentTxOuts
     * @returns UnspentTxOut | undefined
     */
    static findUnspentTxOut = (
        aTxOutId: string,
        aTxOutIndex: number,
        aUnspentTxOuts: UnspentTxOut[]
    ): UnspentTxOut | undefined => {
        return aUnspentTxOuts.find(
            (utxo) =>
                utxo.txOutId === aTxOutId && utxo.txOutIndex === aTxOutIndex
        );
    };

    /**
     * getCoinbaseTransaction
     * @param address
     * @param blockIndex
     * @returns Transaction
     */
    static getCoinbaseTransaction = (
        address: string,
        blockIndex: number
    ): Transaction => {
        const coinbaseTx = new Transaction();
        const txIn = new TxIn();

        txIn.signature = "";
        txIn.txOutId = "";
        txIn.txOutIndex = blockIndex;

        coinbaseTx.txIns = [txIn];
        coinbaseTx.txOuts = [new TxOut(address, COINBASE_AMOUNT)];
        coinbaseTx.id = this.getTransactionId(coinbaseTx);
        return coinbaseTx;
    };

    /**
     * signTxIn
     * : private key를 활용하여 transaction id를 서명함
     * - 서명된 이후엔 transaction 내용을 변경할 수 없음
     * -
     * @param transaction
     * @param txInIndex
     * @param privatekey
     * @param aUnspentTxOuts
     * @returns string
     */
    static signTxIn = (
        transaction: Transaction,
        txInIndex: number,
        privatekey: string,
        aUnspentTxOuts: UnspentTxOut[]
    ): string => {
        const txIn: TxIn = transaction.txIns[txInIndex];
        const dataToSign = transaction.id;
        const referencedUnspentTxOut: UnspentTxOut | undefined =
            this.findUnspentTxOut(
                txIn.txOutId,
                txIn.txOutIndex,
                aUnspentTxOuts
            );
        if (referencedUnspentTxOut === undefined) {
            console.log("Cannot find referenced txOut");
            throw Error();
        }
        const referencedAddress = referencedUnspentTxOut.address;

        if (this.getPublicKey(privatekey) !== referencedAddress) {
            console.log("Invalid private key!");
            throw Error();
        }

        const key = ec.keyFromPrivate(privatekey, "hex");
        // DER : Distinguished Encoding Rules
        const signature: string = this.toHexString(
            key.sign(dataToSign).toDER()
        );

        return signature;
    };

    /**
     * updateUnspentTxOuts
     * - 새로운 블록이 생성될 때마다 UTXO를 갱신해야 함
     * @param newTransactions
     * @param aUnspentTxOuts
     * @returns 새로운 블록의 UTXO + 소비되지 않은 기존 UTXO
     */
    static updateUnspentTxOuts = (
        newTransactions: Transaction[],
        aUnspentTxOuts: UnspentTxOut[]
    ): UnspentTxOut[] => {
        // 새로 생성된 블록에서의 UTXO
        const newUnspentTxOuts: UnspentTxOut[] = newTransactions
            .map((tx) => {
                return tx.txOuts.map(
                    (txOut, index) =>
                        new UnspentTxOut(
                            tx.id,
                            index,
                            txOut.address,
                            txOut.amount
                        )
                );
            })
            .reduce((a, b) => a.concat(b), []);
        console.log("newUnspentTxOuts: ");
        console.log(newUnspentTxOuts);

        // 블록에서 소비된 Transaction output들
        const consumedTxOuts: UnspentTxOut[] = newTransactions
            .map((tx) => tx.txIns)
            .reduce((a, b) => a.concat(b), [])
            .map(
                (txIn) => new UnspentTxOut(txIn.txOutId, txIn.txOutIndex, "", 0)
            );

        // (기존 UTXO에서 consumed transaction들을 제외한 나머지 트랜잭션들) + (새로운 블록의 UTXO들)
        const resultingUnspentTxOuts = aUnspentTxOuts
            .filter(
                (utxo) =>
                    !this.findUnspentTxOut(
                        utxo.txOutId,
                        utxo.txOutIndex,
                        consumedTxOuts
                    )
            )
            .concat(newUnspentTxOuts);

        return resultingUnspentTxOuts;
    };

    /**
     * processTransactions
     * : UTXO를 갱신하기 전에 검증 과정을 거침
     * 1. transaction 구조 확인
     * 2. block의 transaction 검증
     * @param aTransactions
     * @param aUnspentTxOuts
     * @param blockIndex
     * @returns
     */
    static processTransactions = (
        aTransactions: Transaction[],
        aUnspentTxOuts: UnspentTxOut[],
        blockIndex: number
    ) => {
        if (!this.isValidTxListStructure(aTransactions)) {
            console.log("Invalid transaction structure");
            return null;
        }

        if (
            !this.validateBlockTransactions(
                aTransactions,
                aUnspentTxOuts,
                blockIndex
            )
        ) {
            console.log("Invalid block transaction");
            return null;
        }

        return this.updateUnspentTxOuts(aTransactions, aUnspentTxOuts);
    };

    /**
     * toHexString
     * : 숫자 배열을 하나의 16진수로 나타냄
     * @param byteArray number[]
     * @returns
     */
    static toHexString = (byteArray: number[]): string => {
        // 한자리 수도 두자리로 나타내기 위해 "0"을 더함
        // 두자리 수는 0을 더해서 세자리가 되므로 slice로 마지막 두 숫자만 반환
        return Array.from(byteArray, (byte: any) =>
            ("0" + (byte & 0xff).toString(16)).slice(-2)
        ).join("");
    };

    /**
     * getPublicKey
     * : private key를 통해 public key를 얻음
     * @param aPrivatekey
     * @returns
     */
    static getPublicKey = (aPrivatekey: string): string => {
        return ec
            .keyFromPrivate(aPrivatekey, "hex")
            .getPublic()
            .encode("hex", false);
    };

    static isValidTxInStructure = (txIn: TxIn): boolean => {
        if (txIn == null) {
            console.log("TxIn is null");
            return false;
        } else if (typeof txIn.signature !== "string") {
            console.log("Invalid signature type in TxIn");
            return false;
        } else if (typeof txIn.txOutId !== "string") {
            console.log("Invalid txOutId type in TxIn");
            return false;
        } else if (typeof txIn.txOutIndex !== "number") {
            console.log("Invalid number type in TxIn");
            return false;
        }
        return true;
    };

    static isValidTxOutStructure = (txOut: TxOut): boolean => {
        if (txOut == null) {
            console.log("TxOut is null");
            return false;
        } else if (typeof txOut.address !== "string") {
            console.log("Invalid address type in TxOut");
            return false;
        } else if (typeof txOut.amount !== "number") {
            console.log("Invalid number type in TxOut");
            return false;
        }

        return true;
    };

    static isValidTxListStructure = (transactions: Transaction[]): boolean => {
        return transactions
            .map(this.isValidTransactionStructure)
            .reduce((a, b) => a && b, true);
    };
    static isValidTransactionStructure = (
        transaction: Transaction
    ): boolean => {
        if (typeof transaction.id !== "string") {
            console.log("Transaction Id missing");
            return false;
        }
        if (!(transaction.txIns instanceof Array)) {
            console.log("Invalid txIns type in transaction");
            return false;
        }
        if (
            !transaction.txIns
                .map(this.isValidTxInStructure)
                .reduce((a, b) => a && b, true)
        ) {
            return false;
        }

        if (!(transaction.txOuts instanceof Array)) {
            console.log("Invalid txOuts type in transaction");
            return false;
        }
        if (
            !transaction.txOuts
                .map(this.isValidTxOutStructure)
                .reduce((a, b) => a && b, true)
        ) {
            return false;
        }

        return true;
    };

    /**
     * isValidAddress
     * - 지갑 주소 형식 = "04" + "X좌표" + "Y좌표"
     * 1. 길이가 130인지 확인
     * 2. 16진수인지 확인
     * 3. "04"로 시작하는지 확인
     * @param address
     * @returns
     */
    static isValidAddress = (address: string): boolean => {
        if (address.length !== 130) {
            console.log("Invalid public key length");
            return false;
        } else if (address.match("^[a-fA-F0-9]+$") === null) {
            console.log("Public key must contain only hex characters");
            return false;
        } else if (!address.startsWith("04")) {
            console.log("Public key must star with 04");
            return false;
        }

        return true;
    };
}

export { Transaction, TxIn, TxOut, UnspentTxOut, TxFunctions };
