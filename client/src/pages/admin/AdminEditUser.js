import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axios';
import { useAdminContext } from '../../hooks/useAdminContext';

function AdminEditUser({setNavbar, props}) {

    const {user} = useParams();
    const navigate = useNavigate();
    const [msg, setMsg] = useState("");
    const {admin} = useAdminContext();
    const [username, setUsername] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [subscription, setSubscription] = useState("");

    useEffect(() => {
        setNavbar(false);
    })

    useEffect(() => {
        axios.get(`/api/admin/getuser/${user}`, {headers: {
            adminToken : admin.token.adminToken
        }}).then((response) => {
            if(!response.data.error){
            const json = response.data;
                setUsername(json.username)
                setPhoneNumber(json.phoneNumber)
                setEmail(json.email)
                setSubscription(json.subscription)
            }
        })
    } ,[])

    const submitEdit = () =>{
        const data = {username: user, phoneNumber: phoneNumber, email:email, subscription:subscription}
        axios.put('/api/admin/user/update', data, {headers: {
            adminToken: admin.token.adminToken
        }}).then((response) => {
          if(!response.data.error){
            setMsg(response.data.status);
            const delay = () => {
              navigate('/admin/users')
            }
            setTimeout(delay, 2000);
          }
        })
    }
    
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-12 mb-4">
        <h1 className="mt-4 header-title text-center">EDIT USER</h1>
        </div>
        <div className='col-md-5'>
        
          {msg && (<div class="alert alert-success" role="alert"> {msg} </div>)}
          
          <label>Username</label>
          <input type="text" className='form-control shadow-none' defaultValue={username} readOnly disabled />
          <label className='mt-3'>Phone Number</label>
          <input type="text" className='form-control shadow-none' defaultValue={phoneNumber} onChange={(event) =>{setPhoneNumber(event.target.value)}}/>
          <label className='mt-3'>Email</label>
          <input type="text" className='form-control shadow-none' defaultValue={email} onChange={(event) =>{setEmail(event.target.value)}}/>
          <label className='mt-3'>Subscription</label>
          <input type="text" className='form-control shadow-none' defaultValue={subscription} onChange={(event) =>{setSubscription(event.target.value)}}/>
          <div className="d-grid gap-2 my-4">
            <button className="btn btn-primary mt-3" onClick={submitEdit}>Submit</button>
          </div>
        </div>
        </div>
        </div>
  )
}

export default AdminEditUser