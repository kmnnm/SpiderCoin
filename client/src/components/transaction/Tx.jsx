import React from "react";
import Transaction from "./Transaction";

const Tx = () => {
    return (
        <div>
            <Transaction peer={3001} />
            <Transaction peer={3002} />
            <Transaction peer={3003} />
        </div>
    );
};

export default Tx;
