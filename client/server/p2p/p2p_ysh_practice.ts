import WebSocket = require("ws");
import {Server} from "ws";
import Block from "../blockchain/block";
import Blockchain from "../blockchain/blockchain"

const blockchain = new Blockchain();
const sockets: WebSocket[] = [];

enum MessageType {
  QUERY_LATEST,
  QUERY_ALL,
  RESPONSE_BLOCKCHAIN,
}

class Message {
  public type: MessageType;
  public data: any;
  constructor(type: MessageType, data: any){
    this.type = type;
    this.data = data;
  }
}

const getSockets = (): WebSocket[] => {
  return sockets;
}

// 지정한 소켓에 메세지 전달
const write = (ws: WebSocket, message: Message): void => ws.send(JSON.stringify(message));

// 연결된 모든 소켓에 메세지 보냄
const broadcast = (message: Message): void => sockets.forEach((socket) => write(socket, message));

const initP2PServer = (p2pPort: number) => {
  const server: Server = new WebSocket.Server({port: p2pPort});
  server.on("connection", (ws: WebSocket) => {
    initConnection(ws);
  });
  console.log("Listening WebSocket p2p port on: ", p2pPort);
}

const initConnection = (ws: WebSocket) => {
  sockets.push(ws);

  initMessageHandler(ws);
  initErrorHandler(ws);
  console.log("InitConnection!");
}

const JsonToObject = <T>(data: string): T => {
  try {
    return JSON.parse(data);
  } catch (err: any) {
    console.error(err);
    return err;
  }
}

// 메세지를 보낼때 동작을 나타내는 함수
const initMessageHandler = (ws: WebSocket) => {
  console.log("Inint Message Handler");
  ws.on("message", (data: string) => {
    try {
      const message: Message = JSON.parse(data); // JSON => Object
      // 메세지가 없으면 바로 함수 탈출
      if(message === null) {
        console.log("Cannot parse received JSON message: " + data);
        return;
      }

      // 메세지가 있으면 타입별로 다른 동작 실행
      console.log("Received message: %s", JSON.stringify(message));
      switch (message.type) {
        case MessageType.QUERY_LATEST:
          write(ws, responseLatestMsg());
          break;
        case MessageType.QUERY_ALL:
          write(ws, responseChainMsg());
          break;
        case MessageType.RESPONSE_BLOCKCHAIN:
          const receivedBlocks: Block[] = JSON.parse(message.data);
          if(receivedBlocks === null) {
            console.log("Invalid blocks received: %s", JSON.stringify(message.data));
          };
          handleBlockchainResponse(receivedBlocks);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(error);
    }
  })
}

// Blockchain을 받았을 때 응답을 나타내는 함수
const handleBlockchainResponse = (receivedBlocks: Block[]) => {
  // Block이 없으면 바로 함수 탈출
  if (receivedBlocks.length === 0) {
    console.log("received blockchain size of 0");
    return;
  }

  // 받은 블록체인의 마지막 블록의 구조 검증
  const latestBlockReceived: Block = receivedBlocks[receivedBlocks.length - 1];
  if(!Blockchain.isValidBlockStructure(latestBlockReceived)) {
    console.log("Invalid block structure");
    return;
  }

  // 가지고 있는 블록과 비교
  const latestBlockHeld: Block = blockchain.getLastBlock();
  if(latestBlockReceived.header.index > latestBlockHeld.header.index) {
    // 받은 블록의 index가 크면 더 최신의 블록을 가지고 있을 가능성이 있음
    console.log(
			"Blockchain possibly behind. We got: " +
				latestBlockHeld.header.index +
				" Peer got: " +
				latestBlockReceived.header.index
		);

    // 내 블록의 hash와 받은 블록의 prevHash 비교
    if (latestBlockHeld.hash === latestBlockReceived.header.prevHash) {
      // hash가 같으면 새로 받은 블록을 내 블록체인에 잘 추가되는지 확인
      if(blockchain.addBlock(latestBlockReceived.data)) {
        // addBlock()이 잘 됐으면 해당 블록을 포함하여 응답을 보냄
        broadcast(responseLatestMsg());
      } else {
				console.log("AddBlock falied. Invalid block!");
			}
    } 
    // hash가 다르고 받은 블록체인의 길이가 1이면 연결된 모든 블록을 요청한다.
    else if (receivedBlocks.length === 1) {
      console.log("We have to query the chain from our peer");
      broadcast(queryAllMsg());
    }
    // hash가 다르고 블록체인의 길이가 1이 아니면, 받은 블록체인으로 교체
    else {
      console.log("Received blockchain is longer than current blockchain");
      blockchain.replaceChain(receivedBlocks);
    }
  } 
}

const queryChainLengthMsg = (): Message => ({
  type: MessageType.QUERY_LATEST,
  data: null,
})

const queryAllMsg = (): Message => ({
  type: MessageType.QUERY_ALL,
  data: null,
})

const responseChainMsg = (): Message => ({
  type: MessageType.RESPONSE_BLOCKCHAIN,
  data: JSON.stringify(blockchain.chain),
})

const responseLatestMsg = (): Message => ({
  type: MessageType.RESPONSE_BLOCKCHAIN,
  data: JSON.stringify(blockchain.getLastBlock()),
})

const initErrorHandler = (ws: WebSocket) => {
  ws.on("close", () => {
    closeConnection(ws);
  })
  ws.on("error", () => {
    closeConnection(ws);
  })
}

// 연결 해제되면 sockets에서 해당 웹소켓 서버 제거
const closeConnection = (ws: WebSocket) => {
  console.log("Connection failded to peer: ", ws.url);
  sockets.splice(sockets.indexOf(ws), 1);
};

