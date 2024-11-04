import React, {useState, useEffect} from 'react';
import axios from '../../api/axios';
import { useAdminContext } from '../../hooks/useAdminContext';
import { useLocation, useNavigate } from 'react-router-dom';

function AdminLogin({setNavbar, props}) {

  useEffect(() => {
    setNavbar(false);
})

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const {adminValid} = useAdminContext();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/admin/panel";

  const Login = () => {
    const data = { username: username, password: password };
    axios.post('/api/admin/login', data).then( async (response) => {
      const json = await response.data;
      if(json.error){
        setErrMsg(json.error);
      }else{
        localStorage.setItem("adminToken", JSON.stringify({token: json}));
        adminValid({type: 'AUTHENTICATE', payload: json})
        navigate(from, {replace:true})
      }
    }).then((response) => {
      if(response){
        const reload = () => {
          window.location.reload()
        }
        setTimeout(reload, 1000)       
      }
    })
  }

  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center">
        <div className="col-lg-12">
        <h1 className="my-4 header-title text-center">ADMIN PANEL SIGN IN</h1>
        </div>
        <div className='col-md-5'>
          <label>Username</label>
          <input type="text" className='form-control shadow-none' onChange={(event) => {setUsername(event.target.value)}} />
          <label className='mt-3'>Password</label>
          <input type="password" className='form-control shadow-none' onChange={(event) => {setPassword(event.target.value)}}  />
          <div className="d-grid gap-2 my-4">
            <button className="btn btn-primary mt-3" onClick={Login} >Sign In</button>
          </div>
          {!errMsg ?(<></>):(
                    <>
                <div class="alert alert-danger" role="alert">
                    {errMsg}
                </div>
                    </>
                )}
          </div>
        </div>  
        </div>
      </div>
  )
}

export default AdminLogin