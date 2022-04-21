# 🕸 SpiderCoin

> 프로젝트 기간 : `2022-01-05 ~ 2022-01-19`

## 협업 자료

[Notion](https://charm-locust-333.notion.site/SPIDER-COIN-c4795107c2474455bd4f93016bad8fbf)

## 팀원

- [김현호 (Kim, HyeonHo)](https://github.com/alsrhkd101)
- [윤석훈 (Yoon, SeokHun)](https://github.com/imysh578)
- [최현석 (Choi, HyunSeok)](https://github.com/Tozinoo)
  <br>

## 사용법 (Getting Started)

#### `cd client` : 클라이언트 폴더로 이동 후 아래 명령어 사용

#### `npm run dev1`

[Node1 (http port: 3001, p2p port: 6001)](http://localhost:3001) 서버 실행

#### `npm run dev2`

[Node1 (http port: 3002, p2p port: 6002)](http://localhost:3002) 서버 실행

#### `npm run dev3`

[Node1 (http port: 3003, p2p port: 6003)](http://localhost:3003) 서버 실행

#### `npm start`

3개의 서버들을 다 실행하고 웹페이지를 연다.
[웹페이지 (port: 3000)](http://localhost:3000) 열기

# 1. 기획 의도

- 마이닝, 지갑 생성 등 핵심기능을 직접 구현하여 블록체인에 대한 이해도 높이기
  <br>

# 2. 프로젝트 목표

- 블록체인 생성 및 개인 지갑 연동
- 3개의 노드를 통해 실시간으로 통신을 확인한다.
- PoW 합의알고리즘을 통해 가장 긴 블록체인을 채택하고 연결된 모든 노드가 같은 데이터를 갖는다.
- Transaction Pool(Mempool)과 Unspent Transaction Output의 역할을 이해하고 트랜잭션의 흐름을 파악한다.
  <br>

# 3. 페이지 구성

| 페이지          | 화면                                                                                                                  | 설명                                                          |
| --------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Main**        | ![main](https://user-images.githubusercontent.com/43943231/150467120-c7c488ec-0f2f-4ad6-bc0c-4544ba86a1cb.gif)        | 연결된 블록들을 시각화                                        |
| **Login**       | ![login](https://user-images.githubusercontent.com/43943231/150468611-bda4ef13-21a1-491d-9538-0e03e9720a6e.gif)       | 이메일과 비밀번호를 이용한 간단한 로그인 및 회원가입          |
| **Mempool**     | ![mempool](https://user-images.githubusercontent.com/43943231/150468693-70c5c1d0-5e39-48bd-be02-d660367daa47.gif)     | 채굴/자동채굴이 가능하고 블록에 포함되지 않은 트랜잭션을 저장 |
| **Transaction** | ![transaction](https://user-images.githubusercontent.com/43943231/150469134-d5804b14-76be-4ce7-ba4f-84ecf8dd3266.gif) | 노드 간의 거래를 통한 트랜잭션 생성                           |
| **Peer**        | ![p2p](https://user-images.githubusercontent.com/43943231/150469049-81fbf084-e455-4766-b707-12edd2c15edf.gif)         | 노드들을 연결시켜 모든 노드가 같은 블록체인을 갖게함          |
| **MyPage**      | ![mypage](https://user-images.githubusercontent.com/43943231/150469084-fedbe970-019e-42b4-b563-ab03d200cbd7.gif)      | Address, Balance, UTXO 정보 확인                              |

<br>

# 4. 개발 환경

## 4-1. 🛠 Tools

### 📢 For Team Communication

- `Discord`
- `Notion`
- `Github`

### ⚙ For Development

- `Ubuntu-20.04`
- `VScode`
  <br>

## 4-2. 📚 Languages & Frameworks

### Front-end

- `React`
- `Javascript`
- `TypeScript`

### Back-end

- `NodeJS`
- `express`
- `MySQL`
- `MariaDB`

### Test-Tool

- `Jest`
  <br>

## 4-3. 🛒 Library

### server

- `express` : @4.17

### router

- `axios` : @0.24
- `react-router-dom`: @6

### database

- `mysql2` : @2.3

### security

- `crypto-js` : @4.1
- `merkle` : @0.6
- `jsonwebtoken` : @8.5

### design

- `react-bootstrap` : @2.1
- `mui` : @5.2
  <br>

# 5. 문제 & 문제 해결 방법

[에러모음집](https://www.notion.so/cacf3f477d484ba0ab3a3c5a261c503a)
# SpiderCoin
