import React from "react";
import P2PTransaction from "./P2PTransaction";
import { Accordion, Dropdown } from "react-bootstrap";


const P2PTx = () => {
    const peer1 = [
        3001,
        "04c34973f019445f48e2b6e05588006773c4daf404cf8803208ed8eac9f9b85be31d90f3d795bc23c6c92a95946b47b2e7a8d00f5a9b5c4e4968746813c3e1542e",
        "a60cf013b2b940c0d8c64f61725f26e41f78b89adc43f33a11d6100b2de31600",
    ]
    const peer2 = [
        3002,
        "0450987f08b0bc0b6edf7c484ae497b5fcfbf2ca7e6ac7efb87092df9d996ac9a23911824d377c07f14208e500005eb03526ffb8ad3ccfe3c0fe4d7a8157b2fb90",
        "ddc261b8739a833cee265d8c7be5cf01cf5aba852651697d7415a0eeb48968a2",
    ]
    const peer3 = [
        3003,
        "04edeaa78d807fe53ba04abdbd9fcd4de511675abfde44a0c4eca681a677911734dff709909cc7a928ead49e92791f8d2dd557682e11e309657cc2fb2a04fd117e",
        "cbfa6b5d0f030a0d446dacb98956ce1c329c17b1319c5060ab24967d66d35e40",
    ]

    return (
			<div>
				<Accordion defaultActiveKey="0">
					<Accordion.Item eventKey="0">
						<Accordion.Header>Peer1</Accordion.Header>
						<Accordion.Body>
							<P2PTransaction peer={peer1} />
						</Accordion.Body>
					</Accordion.Item>
					<Accordion.Item eventKey="1"> 
						<Accordion.Header>Peer2</Accordion.Header>
						<Accordion.Body>
							<P2PTransaction peer={peer2} />
						</Accordion.Body>
					</Accordion.Item>
					<Accordion.Item eventKey="2">
						<Accordion.Header>Peer3</Accordion.Header>
						<Accordion.Body>
							<P2PTransaction peer={peer3} />
						</Accordion.Body>
					</Accordion.Item>
				</Accordion>
			</div>
		);
};

export default P2PTx;
