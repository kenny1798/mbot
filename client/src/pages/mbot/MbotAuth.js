import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuthContext } from '../../hooks/useAuthContext';
import QRCode from 'react-qr-code';
import io from 'socket.io-client';
import LoadingImg from '../../components/loading.gif';

const socket = io.connect(process.env.REACT_APP_SERVER);

function MbotAuth() {

  

    const {user} = useAuthContext();
    const [status, setStatus] = useState("");
    const [buttonHide, setButtonHide] = useState("");
    const [qrValue, setQrValue] = useState("");
    const [logMsg, setLogMsg] = useState("Press Generate QR to begin");
    const [loading, setLoading] = useState("");

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
     

      useEffect(()=> {
        axios.get('/mbot/auth/check', {headers: {
          accessToken:user.token
        }}).then((response) => {
          const json = response.data.status
          if(json == "connected"){
            setStatus("connected");
          }else{
            setStatus("");
          }
        })
      }, [])


      console.log(status)
      
      const generateQR = () =>{
        setLoading('load');
          axios.get('/mbot/auth', {headers: {
            accessToken: user.token
          }})
      }

console.log(status)

  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="mt-4 header-title">CONNECT WHATSAPP</h1>
        </div>
        <div className='row justify-content-center'>
<div className="col-md-8">
      
        {status == 'connected' ? (<div className="card text-center my-3">
        <div className="card-header">WhatsApp Connected 🟢</div><div className="card-body"><button className='btn btn-sm btn-danger'>Reconnect WhatsApp</button></div></div>) : (<div className="card text-center my-3">
        <div className="card-header">
          <p className="card-text">Message: {logMsg}</p>
            {!buttonHide ? (<button className='btn btn-sm btn-success' onClick={generateQR}> Generate QR </button>) : (<></>)}
        </div>
        <div className="card-body">
          {loading && (<img src={LoadingImg} alt='Loading' width='50' />)}
          {qrValue && (<QRCode size={300} bgColor='white' fgColor='black' value={qrValue} />)}
        </div>
      </div>)}
        
    </div>
    </div>
        </div>
        </div>
      </div>
  )
}

export default MbotAuth