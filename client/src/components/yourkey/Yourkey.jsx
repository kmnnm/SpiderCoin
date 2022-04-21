import "./yourkey.scss";
import React from "react";
import { useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { MdContentCopy } from "react-icons/md";
import { useParams } from "react-router-dom";

const Yourkey = ({ dd }) => {
    const [isCopied, setIsCopied] = useState(false);
    const { key } = useParams();

    const codeSnippet = key;

    const onCopyText = () => {
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    };
    return (
        <>
            <div className="yourkey_title">This is your private key!</div>
            <div className="yourkey_subtitle">Copy & don't forget it</div>

            <div className="yourkey_container">
                <div className="code-snippet2">
                    <div className="code-section2">
                        <pre>{codeSnippet}</pre>
                        <CopyToClipboard text={codeSnippet} onCopy={onCopyText}>
                            <span className="yourkey_copied">
                                {isCopied ? "Copied!" : <MdContentCopy />}
                            </span>
                        </CopyToClipboard>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Yourkey;
