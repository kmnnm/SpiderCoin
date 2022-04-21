import React from 'react'
import { Accordion } from 'react-bootstrap';

const TxIn = ({txIn, index}) => {
  if(txIn) {
    return (
			<div className="TxIn">
				<Accordion defaultActiveKey="0" flush>
					<Accordion.Item eventKey={index}>
						<Accordion.Header>TxIn #{index}</Accordion.Header>
						<Accordion.Body>
              <h5>txOutId</h5>
              {txIn.txOutId}
              <h5>txOutIndex</h5>
              {txIn.txOutIndex}
              <h5>signature</h5>
              {txIn.signature}
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

export default TxIn
