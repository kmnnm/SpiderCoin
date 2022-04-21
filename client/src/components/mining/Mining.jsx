import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap';

const Mining = ({txData}) => {
  const params = {
    method: "post",
    baseURL: "http://localhost:3001",
    url: "/mineBlock",
    data: {data:[{tx:"test"}] }
  }
  
  const handleOnClick = () => {
    const result = await axios.request(params);
  }

  return (
    <div>
      <Button onClick={handleOnClick}>Mining</Button>
      <div>
        <h1>Transaction List</h1>
      </div>
    </div>
  )
}

export default Mining
