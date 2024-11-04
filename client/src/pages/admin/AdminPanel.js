import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { useAdminContext } from '../../hooks/useAdminContext';

function AdminPanel({setNavbar, props}) {

  const {admin} = useAdminContext();
  const [active, setActive] = useState(false);
  const [activeMsg, setActiveMsg] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    setNavbar(false);
})

useEffect(() => {
  axios.get('/api/admin/wsauth/check', {headers: {
    adminToken : admin.token.adminToken
  }}).then((response) => {
    const json = response.data.status;
    if(json == true){
      setActive(true);
      setActiveMsg("Admin WhatsApp is Connected ✅");
    }else if (json == false){
      setActiveMsg("Admin WhatsApp is Not Connected ❌")
    }
  })
}, [])


const RescanQR = () => {
  axios.get('/admin/session/delete', {headers: {
    adminToken: admin.token.adminToken
  }}).then(() => {
    navigate('/admin/wsauth')
  })
}

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-12 mb-4">
        <h1 className="mt-4 header-title text-center">ADMIN PANEL</h1>
        </div>
        </div>
        <div className='row justify-content-center mt-3'>
          <div className='col-md-6 text-center'>
          <div class="card">
            <div class="card-body">
              {activeMsg}
              {active == true ? (
                <div className="d-grid my-3 gap-2">
                  <button className='btn btn-sm btn-danger mt' onClick={RescanQR}>Rescan QR</button>
                </div>
              ) : (
                <div className="d-grid my-3 gap-2">
                  <Link className='btn btn-sm btn-success mt' to="/admin/wsauth">Scan QR Now</Link>
                </div>
              )}
            </div>
          </div>
          </div>
          <div className='col-md-6 text-center'>
          <div class="card">
            <div class="card-body">
              Users List
              <div className="d-grid my-3 gap-2">
                  <Link className='btn btn-sm btn-primary mt' to='/admin/users'>Go To List</Link>
                </div>
            </div>
          </div>
          </div>
        </div>
        </div>
  )
}

export default AdminPanel