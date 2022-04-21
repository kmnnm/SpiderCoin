import React, { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import useAxios from '../../hooks/useAxios';
import './Blocks.scss';
import Cube from './Cube';
import GenesisBlock from './GenesisBlock';

const Blocks = () => {
  const [test, setTest] = useState();

  const blocks = useAxios({
    method: 'get',
    baseURL: 'http://localhost:3001',
    url: '/blocks',
  });
  const blocks2 = useAxios({
    method: 'get',
    baseURL: 'http://localhost:3002',
    url: '/blocks',
  });
  const blocks3 = useAxios({
    method: 'get',
    baseURL: 'http://localhost:3003',
    url: '/blocks',
  });

  const txDataList = [{ tx: 'test' }];
  useEffect(() => {
    setTest(blocks.data);
  }, [blocks.data, blocks2.data, blocks3.data]);

  if (blocks.loading || blocks2.loading || blocks3.loading) {
    return (
      <>
        <Spinner animation="border" variant="dark" />
      </>
    );
  } else {
    const genesisBlock = blocks.data[0];
    const restBlocks = blocks.data.slice(1);
    const genesisBlock2 = blocks2.data[0];
    const restBlocks2 = blocks2.data.slice(1);
    const genesisBlock3 = blocks3.data[0];
    const restBlocks3 = blocks3.data.slice(1);
    return (
      <>
        <div className="blocks-container">
          <div className="blockchain">
            <GenesisBlock blockInfo={genesisBlock} />
            {restBlocks.map((block, index) => (
              <Cube key={block.hash} blockInfo={block} txData={txDataList} />
            ))}
          </div>
          <div className="blockchain">
            <GenesisBlock blockInfo={genesisBlock2} />
            {restBlocks2.map((block, index) => (
              <Cube key={block.hash} blockInfo={block} txData={txDataList} />
            ))}
          </div>
          <div className="blockchain">
            <GenesisBlock blockInfo={genesisBlock3} />
            {restBlocks3.map((block, index) => (
              <Cube key={block.hash} blockInfo={block} txData={txDataList} />
            ))}
          </div>
        </div>
      </>
    );
  }
};

export default Blocks;
