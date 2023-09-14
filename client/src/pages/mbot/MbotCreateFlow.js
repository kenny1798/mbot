import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';

function MbotCreateFlow() {

  const {user} = useAuthContext();
  const [flowName, setFlowName] = useState("");
  const navigate = useNavigate();
  const [click, setClick] = useState(false);

  const createFlow = () => {
    const formData = {flowName:flowName};
    axios.post('/api/broadcast/create/flow', formData, {headers: {
      accessToken : user.token
    }}).then((response)=> {
      const id = response.data.id
      setClick(true)
      const delayNav = () => {
        navigate(`/mbot/${id}`)
      }
      setTimeout(delayNav, 2000)
    })
  }

  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="mt-4 header-title">M-BOT</h1>
        </div>
        </div>
    <div className='row justify-content-center'>
    <div className="col-md-6">
  <div className='card'>
  <div className='row justify-content-center'>
    
  <div className='container'>
  <div className='row justify-content-center'>
  <div className='col'>
          <label className='mt-4'><strong>Flow Name</strong></label>
          <input type="text" className='form-control shadow-none'  onChange={(event) => {setFlowName(event.target.value)}} required maxLength="254" />
          <div className="d-grid my-3 gap-2">
            {click == false ? (<button className='btn btn-primary mt' onClick={createFlow}>Submit</button>) : (<></>)}
          
          </div>
          
          
  </div>
  </div>
  </div>
</div>
    </div>
    </div>
    </div>
    </div>
    </div>
  )
}

export default MbotCreateFlow