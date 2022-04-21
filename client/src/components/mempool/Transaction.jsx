import React from "react";
import { Accordion, Dropdown } from "react-bootstrap";
import TxIn from "./TxIn";
import TxOut from "./TxOut";

const Transaction = ({ tx, index }) => {
	return (
		<Accordion defaultActiveKey="0">
			<Accordion.Item eventKey={index}>
				<Accordion.Header>Transaction #{index}</Accordion.Header>
				<Accordion.Body>
					<div>
						<h3>Transaction Id</h3>
						{tx.id}
					</div>
					<Dropdown.Divider />
					<div>
						<h3>Transaction Inputs</h3>
						{tx.txIns.map((txIn, index) => (
							<TxIn key={index} txIn={txIn} index={index} />
						))}
					</div>
					<Dropdown.Divider />
					<div>
						<h3>Transaction Outputs</h3>
						{tx.txOuts.map((txOut, index) => (
							<TxOut key={index} txOut={txOut} index={index}/>
						))}
					</div>
				</Accordion.Body>
			</Accordion.Item>
		</Accordion>
	);
};

export default Transaction;
