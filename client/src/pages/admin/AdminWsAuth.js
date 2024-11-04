import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import QRCode from 'react-qr-code';
import LoadingImg from '../../components/loading.gif';
import { useAdminContext } from '../../hooks/useAdminContext';
import io from 'socket.io-client';

const socket = io.connect(process.env.REACT_APP_SERVER);

function AdminWsAuth({setNavbar, props}) {

  useEffect(() => {
    setNavbar(false);
})

  const [buttonHide, setButtonHide] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [logMsg, setLogMsg] = useState("Press Generate QR to begin");
  const [loading, setLoading] = useState("");
  const {admin} = useAdminContext();

  socket.on('qrvalue', (val) => {
    setQrValue(val)
  })

  socket.on('loading', (val) => {
    setLoading(val)
  })

  socket.on('btnhide', (val) => {
    setButtonHide(val)
  })

  socket.on('message', (msg) => {
    setLogMsg(msg)
  })

  console.log(qrValue)



  const generateQR = () =>{
    setLoading('load');
      axios.get('/admin-auth', {headers: {
        adminToken: admin.token.adminToken
      }})
  }

  return (
    <div className='row justify-content-center'>
<div className="col-md-8">
      <div className="card text-center my-5">
        <div className="card-header">
          <p className="card-text">Message: {logMsg}</p>
            {!buttonHide ? (<button onClick={generateQR}> Generate QR </button>) : (<></>)}
        </div>
        <div className="card-body">
          {loading && (<img src={LoadingImg} alt='Loading' width='50' />)}
          {qrValue && (<QRCode size={300} bgColor='white' fgColor='black' value={qrValue} />)}
        </div>
      </div>
    </div>
    </div>
  )
}

export default AdminWsAuth