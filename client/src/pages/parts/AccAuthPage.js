import React, {useEffect, useState} from 'react';
import axios from '../../api/axios';
import { USERCALL_URL, VALIDATE_URL } from '../../api/url';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useValidContext } from '../../hooks/useValidContext';
import { useNavigate } from 'react-router-dom';

function AccAuthPage() {

  const [data, setData] = useState([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const {user} = useAuthContext();
  const {validator} = useValidContext();
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
   axios.get(USERCALL_URL, {
    headers: {
      accessToken: user.token
    },
   }).then ((response) =>{
    setData(response.data.user);
  })
}, [user])


const requestVerification = (() => {
    axios.get(VALIDATE_URL + "/requestverification", {
      headers:{
        accessToken: user.token
      }
    })
})

const handleSubmit = () => {

  const data = {verificationCode: verificationCode}
  axios.put(VALIDATE_URL + "/validateuser", data,
   {
    headers: {
      accessToken: user.token
    }
  }).then(async (response) => {
    const valtoken = await response.data.valToken;
    if(response.data.error){
    setErrMsg(response.data.error)
  }else{
    setSuccessMsg(response.data.success)
    localStorage.setItem("validToken", JSON.stringify(valtoken))
    validator({type: 'VALIDATE', payload: valtoken})
    setTimeout(navigate("/"), 1000)
  }
})
}
 

  return (
            <div className="row justify-content-center text-center">
              <div className="col-sm-8">
            <div class="alert alert-success" role="alert">
            <h2 className="mt-4 font-weight-bold-display-4">Your Registered Phone Number:</h2>
            <h2 className="mb-4 font-weight-bold-display-4">{data.phoneNumber}</h2>
            <div className='mb-3'>
          <button className="btn btn btn-primary mx-4" onClick={requestVerification}>Request Verification Code</button>
          </div>
          <div>
          Not Your Number? 👇<br/>
          <a href="/change-hp" className="">Change Phone Number</a>
          </div>  
                </div>
                </div>
                <div className='col-sm-6'>
                    <input className="form-control" required onChange={(event) => {setVerificationCode(event.target.value)}} label="verificationCode" name="verificationCode" type="text" placeholder="Place Verification Code Here.." />
                    <div class="d-grid gap-2 ">
                    <button className="btn btn-success mt-4" type="submit" onClick={handleSubmit}>Submit Code</button>
                    </div>
                    {!errMsg ?(<></>):(
                    <>
                <div class="alert alert-danger" role="alert">
                    {errMsg}
                </div>
                    </>
                )}
                {!successMsg ?(<></>):(
                    <>
                <div class="alert alert-success" role="alert">
                    {successMsg}
                </div>
                    </>
                )}  
            </div></div>
        )}

export default AccAuthPage