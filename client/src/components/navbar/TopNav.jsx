import React, { useState } from "react";
import { Nav, Navbar, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import OffcanvasComp from "../offcanvas/OffcanvasComp";
import Wallet from "../wallet/Wallet";
import axios from "axios";
import { useCookies } from "react-cookie";

import jwtDecode from "jwt-decode";
import _ from "lodash";

function TopNav() {
    const [show, setShow] = useState(false);
    const [signined, setSignined] = useState(false);
    const [tokenUser, setTokenUser, removeCookie] = useCookies(["x_auth"]);
    const [balance, setBalance] = useState(0);

    const handleClose = () => setShow(false);
    const handleShow = (e) => setShow(true);

    if (_.isEmpty(tokenUser)) {
        return (
            <>
                <Navbar className="top-nav-container" collapseOnSelect expand="lg" bg="dark" variant="dark">
                    <Container>
                        <Navbar.Brand href="/">Spider Coin 🕷</Navbar.Brand>
                        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                        <Navbar.Collapse id="responsive-navbar-nav">
                            <Nav className="me-auto">
                                <Nav>
                                    <Link to="/blocks">Blocks</Link>
                                </Nav>

                                <Nav>
                                    <Link to="/mempool">Mempool</Link>
                                </Nav>
                                <Nav>
                                    <Link to="/p2ptransaction">
                                        Transaction
                                    </Link>
                                </Nav>
                            </Nav>
                            <Nav>
                                <>
                                    <Nav>
                                        <Link to="/signin">Sign-in</Link>
                                    </Nav>
                                    <Nav>
                                        <Link to="/signup">Sign-up</Link>
                                    </Nav>
                                </>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </>
        );
    } else if (!_.isEmpty(tokenUser)) {
        const user = jwtDecode(tokenUser.x_auth);
        const params = {
            method: "get",
            baseURL: "http://localhost:3001",
            url: `balance/${user.address}`,
        };

        const getBalance = async () => {
            const result = await axios.request(params);
            setBalance(result.data.balance);
        };
        getBalance();

        return (
            <>
                <Navbar className="top-nav-container" collapseOnSelect expand="lg" bg="dark" variant="dark">
                    <Container>
                        <Navbar.Brand href="/">Spider Coin 🕷</Navbar.Brand>
                        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                        <Navbar.Collapse id="responsive-navbar-nav">
                            <Nav className="me-auto">
                                <Nav>
                                    <Link to="/blocks">Blocks</Link>
                                </Nav>

                                <Nav>
                                    <Link to="/mempool">Mempool</Link>
                                </Nav>
                                <Nav>
                                    <Link to="/p2ptransaction">
                                        Transaction
                                    </Link>
                                </Nav>
                                <Nav>
                                    <Link to="/peer">Peer</Link>
                                </Nav>
                            </Nav>
                            <Nav>
                                <Nav.Link onClick={handleShow}>MyPage</Nav.Link>
                                <Nav>
                                    <Nav.Link href="/api/user/logout">
                                        Logout
                                    </Nav.Link>
                                </Nav>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
                <OffcanvasComp
                    show={show}
                    onHide={handleClose}
                    title={user.email}
                    placement={"end"}
                    scroll={true}
                    backdrop={true}
                >
                    <Wallet address={user.address} balance={balance} />
                </OffcanvasComp>
            </>
        );
    }
}

export default TopNav;
