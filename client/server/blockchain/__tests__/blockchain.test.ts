import Block from "../block";
import Blockchain from "../blockchain";

describe("Blockchain test", () => {
	let blockchain1: Blockchain;
	let blockchain2: Blockchain;
	let testData1: object[];
	let testData2: object[];
	beforeEach(() => {
		testData1 = [{ tx: "1" }];
		testData2 = [{ tx: "2" }];
		blockchain1 = new Blockchain();
		blockchain2 = new Blockchain();
	});

	test("First Block of blockchain is Genesis Block", () => {
		expect(blockchain1.chain[0]).toEqual(Block.getGenesisBlock());
	});

	test("Add block into blockchain", () => {
		let newBlock: Block = blockchain1.addBlock(testData1);

		// test data
		expect(newBlock.data).toEqual(testData1);
		expect(blockchain1.getLastBlock().data).toEqual(testData1);
		expect(blockchain1.chain[blockchain1.chain.length - 1].data).toEqual(testData1);

		// test Block
		expect(blockchain1.getLastBlock()).toEqual(newBlock);
		expect(blockchain1.chain[blockchain1.chain.length - 1]).toEqual(newBlock);
	});

  // test isValidChain function
	describe('validate chain :', () => {
		test("valid chain after mining block => true", () => {
			blockchain2.addBlock(testData1);
			expect(Blockchain.isValidChain(blockchain2.chain)).toBe(true);
		});
		test("corrupt genesis data => false", () => {
			blockchain2.chain[0].data = [{ tx: "corrupted genesis" }];
			expect(Blockchain.isValidChain(blockchain2.chain)).toBe(false);
		});
		test("corrupt genesis hash => false", () => {
			blockchain2.chain[0].hash = "corrupted genesis";
			expect(Blockchain.isValidChain(blockchain2.chain)).toBe(false);
		});
		test("corrupt new Block data => false", () => {
			blockchain2.addBlock(testData1);
			blockchain2.getLastBlock().data = [{tx: "corrupted newBlock"}];
			expect(Blockchain.isValidChain(blockchain2.chain)).toBe(false);
		});
		test("corrupt middle of Blockchain data => false", () => {
			let block1 = blockchain2.addBlock(testData1);
			let block2 = blockchain2.addBlock(testData2);
			block1.data = [{tx: "corrupted newBlock"}];
			expect(Blockchain.isValidChain(blockchain2.chain)).toBe(false);
		});
		test("corrupt middle of Blockchain prevHash => false", () => {
			let block1 = blockchain2.addBlock(testData1);
			let block2 = blockchain2.addBlock(testData2);
			block1.header.prevHash = "5".repeat(64);
			expect(Blockchain.isValidChain(blockchain2.chain)).toBe(false);
		});
		test("corrupt middle of Blockchain timestamp => false", () => {
			let block1 = blockchain2.addBlock(testData1);
			let block2 = blockchain2.addBlock(testData2);
			block1.header.timestamp = block2.header.timestamp + 1;
			expect(Blockchain.isValidChain(blockchain2.chain)).toBe(false);
		});
	})
	
});
