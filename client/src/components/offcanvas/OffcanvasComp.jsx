import "./OffcanvasComp.scss";
import { Offcanvas } from "react-bootstrap";

function OffcanvasComp({ children, show, onHide, title, ...props }) {
    return (
        <>
            <Offcanvas show={show} onHide={onHide} {...props}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{title}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>{children}</Offcanvas.Body>
            </Offcanvas>
        </>
    );
}

export default OffcanvasComp;
