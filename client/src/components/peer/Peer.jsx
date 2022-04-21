import React from "react";
import Peer1 from "./Peer1";
import Peer2 from "./Peer2";
import Peer3 from "./Peer3";
import "./Peer.scss";

const Peer = () => {
    return (
        <div className="peers-container">
            <Peer1 />
            <br/>
            <Peer2 />
            <br/>
            <Peer3 />
        </div>
    );
};

export default Peer;
