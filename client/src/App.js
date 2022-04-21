import "./App.css";
import TopNav from "./components/navbar/TopNav";
import { Route, Routes } from "react-router-dom";
import Home from "./components/home/Home";
import Blocks from "./components/blocks/Blocks";
import Signin from "./components/sign/Signin";
import Signup from "./components/sign/Signup";
import Mempool from "./components/mempool/Mempool";
import Tx from "./components/transaction/Tx";
import Peer from "./components/peer/Peer";
import Peer1 from "./components/peer/Peer1";
import Peer2 from "./components/peer/Peer2";
import Yourkey from "./components/yourkey/Yourkey";
import P2PTx from "./components/p2pTransaction/P2PTx";

function App() {
    return (
        <>
            <TopNav />
            <div className="main-contents-container">
                <Routes>
                    <Route path="/">
                        <Route index element={<Blocks />}></Route>
                        <Route path="blocks" element={<Blocks />} />
                        <Route path="mempool" element={<Mempool />} />
                        <Route path="peer">
                            <Route index element={<Peer />} />
                            <Route path="1" element={<Peer1 />} />
                            <Route path="2" element={<Peer2 />} />
                        </Route>
                        <Route path="signin" element={<Signin />} />
                        <Route path="signup" element={<Signup />} />
                        <Route path="yourkey/:key" element={<Yourkey />} />
                        <Route path="p2ptransaction" element={<P2PTx />} />
                    </Route>
                </Routes>
            </div>
        </>
    );
}

export default App;
