import merkle from "merkle";
import {Block, BlockHeader} from "../block"
import Blockchain from "../blockchain"

/**
 * 새로 생성된 블록에 대한 테스트 진행 
*/ 
describe("NewBlock test", () => {
  let data: object[],
    blockchain: Block[],
    lastBlock: Block,
		newBlock: Block;
  beforeEach(() => {
    data = [{data: "test"}, {asdf: "asdf"}];
    blockchain = new Blockchain().chain;
    lastBlock = new Blockchain().getLastBlock();
    newBlock = Block.mineNewBlock(lastBlock, data);
  })

  // newBlock 요소들의 타입 테스트
  test("newBlock structure validation", ()=>{
    expect(typeof newBlock.hash).toBe("string");
    expect(typeof newBlock.header.version).toBe("string");
    expect(typeof newBlock.header.index).toBe("number");
    expect(typeof newBlock.header.prevHash).toBe("string");
    expect(typeof newBlock.header.merkleRoot).toBe("string");
    expect(typeof newBlock.header.timestamp).toBe("number");
    expect(typeof newBlock.header.difficulty).toBe("number");
    expect(typeof newBlock.header.nonce).toBe("number");
  })
  
  // newBlock의 version 테스트
  test("newBlock's version validation", () => {
    const version: string = newBlock.header.version;
    const expectedVersion: string = Block.getVersion();
    expect(version).toBe(expectedVersion)
  })


  // 새로운 블록이 올바른 블록인지 테스트
  test("mineNewBlock validation", () => {
    expect(newBlock.header.prevHash).toBe(lastBlock.hash);
    expect(newBlock.hash.startsWith("0".repeat(newBlock.header.difficulty))).toBeTruthy()
  })
  test("compare merkleRoot to calculated one => same", ()=>{
    const calMerkleRoot = merkle("sha256").sync([JSON.stringify(newBlock.data)]).root();
    expect(newBlock.header.merkleRoot).toEqual(calMerkleRoot);
  })
  test("remove orginal data and compare to merkleRoot => invalid data", ()=>{
    newBlock.data = [{hacked : "corrupted"}]
    const calCorruptedMerkleRoot = merkle("sha256").sync(newBlock.data).root();    
    expect(newBlock.header.merkleRoot).not.toEqual(calCorruptedMerkleRoot);
  })
  test("corrupt orginal data and compare to merkleRoot => invalid data", ()=>{
    newBlock.data = [{hacked : "corrupted"}, {asdf:"asdf"}]
    const calCorruptedMerkleRoot = merkle("sha256").sync(newBlock.data).root();    
    expect(newBlock.header.merkleRoot).not.toEqual(calCorruptedMerkleRoot);
  })

  // difficulty 변화 테스트
  describe("adjust difficulty when creating new block", () => {
    function getTestBlock (prevTimestamp: number, currentTimestamp: number, currentIndex: number): number {
      const testHeader = new BlockHeader ("version", currentIndex, "hash", "merkleRoot", prevTimestamp, 3, 0)
      const testBlock = new Block(testHeader, Block.calHashOfBlock(testHeader), []);
      const difficulty = Block.adjustDifficulty(testBlock, currentTimestamp)
      return difficulty;
    }
    let testBlockDifficulty:number;
    beforeAll(()=> {
      testBlockDifficulty = 3;
    })
    
    test("takes more than MINE_INTERVAL*2, decrease difficulty", () => {
      
      const difficulty = getTestBlock(0, 201, 10)
      expect(difficulty).toBe(testBlockDifficulty-1)
    })

    test("takes less than MINE_INTERVAL/2, increase difficulty", () => {
      const difficulty = getTestBlock(0, 49, 10)
      expect(difficulty).toBe(testBlockDifficulty+1)
    })

    test("takes time between MINE_INTERVAL/2 and MINE_INTERVAL*2, no change difficulty", () => {
      const difficulty = getTestBlock(0, 50, 10)
      expect(difficulty).toBe(testBlockDifficulty)
    })

    test("Although it meets conditions of MINE_INTERVAL, if index doesn't meet BLOCK_GENERATION_INTERVAL, no change difficulty", () => {
      const difficulty = getTestBlock(0, 201, 3)
      expect(difficulty).toBe(testBlockDifficulty)
    })
  })
})
