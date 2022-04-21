import React, { useEffect, useState } from "react";
import axios from "axios";
import { Dropdown, Spinner } from "react-bootstrap";
import MyUTXO from "./MyUTXO";

const Wallet = ({ address, balance }) => {
	const [walletAddress, setWalletAddress] = useState(address);
	const [walletBalance, setWalletBalance] = useState(balance);
	const [myUTXOs, setMyUTXOs] = useState([]);
	const [loading, setLoading] = useState(true);

	const getMyUTXOs = async (address) => {
		try {
			const params = {
				method: "get",
				baseURL: `http://localhost:3001`,
				url: `/myutxos/${walletAddress}`,
			};
			const { data } = await axios(params);
			setMyUTXOs(data);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

    useEffect(() => {
        getMyUTXOs(walletAddress);
    }, []);

	return (
		<>
			<Dropdown.Divider />
			<h2>Address</h2>
			{walletAddress}
			<Dropdown.Divider />
			<h2>Balance</h2>
			{walletBalance}
			<Dropdown.Divider />
			<h2>MyUTXOs</h2>
			{loading ? (
				<Spinner animation="border" variant="dark" />
			) : (
				myUTXOs.map((utxo, index) => (
					<MyUTXO key={index} utxo={utxo} index={index} />
				))
			)}
		</>
	);
};

export default Wallet;
