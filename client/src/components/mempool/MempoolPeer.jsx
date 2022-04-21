import React from "react";
import { Button, Spinner } from "react-bootstrap";
import PopupMsg from "../alert/PopupMsg";
import Transaction from "./Transaction";

const MempoolPeer = ({
    data,
    handleOnClick,
    loading,
    port,
    start,
    intervalId,
    address,
    type,
    text,
}) => {
    return (
        <div className="mempool-peer">
            <div style={{ marginBottom: 20}}>
                <Button variant="warning" onClick={handleOnClick}>
                    Mining {port}
                </Button>
                <Button
                    onClick={(e) => {
                        start(port, address, e);
                    }}
                    variant={intervalId ? "danger" : "primary"}
                    style={{ marginLeft: 20}}
                >
                    Auto Mining {intervalId ? "Stop" : "Start"}
                </Button>
            </div>
            <br/>
            <br/>
            <br/>
            <div>
                <h4>transaction List</h4>
                {loading ? (
                    <Spinner animation="border" variant="dark" />
                ) : (
                    data.length === 0 ? <h1>Empty</h1> :
                    data.map((tx, index) => (
                        <Transaction key={tx.id} tx={tx} index={index} />
                    ))
                )}
            </div>
        </div>
    );
};

export default MempoolPeer;
