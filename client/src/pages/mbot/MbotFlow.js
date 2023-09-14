import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuthContext } from '../../hooks/useAuthContext';
import { Link, useNavigate } from 'react-router-dom';

function MbotFlow() {

    const {user} = useAuthContext();
    const [flow, setFlow] = useState([]);

    useEffect(() => {
        axios.get('api/broadcast/get/flowname/', {headers:{
          accessToken: user.token
        }}).then((response) => {
          setFlow(response.data)
        })
      }, [])

  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="mt-4 header-title">M-BOT</h1>
        <p>Manage Flow</p>
        </div>
        <div className="row justify-content-center text-center">
        <div className='col-sm-8'>
        <div className="d-grid my-3 gap-2">
        <Link className='btn btn-sm btn-success' to='/mbot/create/flow'>+ Create New Flow</Link>
        </div>
            <div className='card'>
        <table class="table table-hover text-center">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">FlowName</th>
      <th scope="col"></th>
    </tr>
  </thead>
    {flow.map((value, key) =>{

  const link = '/mbot/' + value.id;
      return (
  <tbody>
  
    <tr>
      <th scope="row">{key+1}</th>
      <td>{value.flowName}</td>
      <td><Link className='btn btn-sm btn-primary' to={link}>Edit</Link></td>
    </tr>
  </tbody>)
    })}
    </table>
    </div>
    </div>
    </div>
        </div>
        </div>
        </div>
  )
}

export default MbotFlow