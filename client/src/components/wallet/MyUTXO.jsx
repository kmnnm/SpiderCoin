import React from "react";
import { Accordion, Dropdown } from "react-bootstrap";

const MyUTXO = ({index, utxo}) => {
	return (
		<Accordion defaultActiveKey="0">
			<Accordion.Item eventKey={index}>
				<Accordion.Header>Transaction #{index}</Accordion.Header>
				<Accordion.Body>
					<div>
						<h3>Transaction Output Id</h3>
						{utxo.txOutId}
					</div>
					<Dropdown.Divider />
					<div>
						<h3>Transaction Output Index </h3>
            {utxo.txOutIndex}
					</div>
					<Dropdown.Divider />
					<div>
						<h3>Address</h3>
						{utxo.address}
					</div>
					<Dropdown.Divider />
					<div>
						<h3>Amount</h3>
						{utxo.amount}
					</div>
				</Accordion.Body>
			</Accordion.Item>
		</Accordion>
	);
};

export default MyUTXO;
