import React from 'react';
import './GenesisBlock.scss';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 640,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const GenesisBlock = ({ blockInfo }) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <div className="genesisBlock" onClick={handleOpen}>
        {blockInfo.header.index}
        <div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <div>
            <b>index</b> : {blockInfo.header.index}
          </div>
          <div>
            <b>prevHash</b> : {blockInfo.header.prevHash}
          </div>
          <div>
            <b>merkleRoot</b> : {blockInfo.header.merkleRoot}
          </div>
          <div>
            <b>timestamp</b> : {blockInfo.header.timestamp}
          </div>
          <div>
            <b>hash</b> : {blockInfo.hash}
          </div>
          <div>
            <b>difficulty</b> : {blockInfo.header.difficulty}
          </div>
          <div>
            <b>nonce</b> : {blockInfo.header.nonce}
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default GenesisBlock;
