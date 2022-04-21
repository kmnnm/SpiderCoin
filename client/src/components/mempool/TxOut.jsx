import React from 'react'
import { Accordion } from 'react-bootstrap';

const TxOut = ({txOut, index}) => {
  if(txOut) {
    return (
			<div className="txOut">
				<Accordion defaultActiveKey="0" flush>
					<Accordion.Item eventKey={index}>
						<Accordion.Header>TxOut #{index}</Accordion.Header>
						<Accordion.Body>
              <h5>address</h5>
              {txOut.address}
              <h5>amount</h5>
              {txOut.amount}
            </Accordion.Body>
					</Accordion.Item>
				</Accordion>
			</div>
		);
  } else {
    return (
      <></>
    )
  }
}

export default TxOut
