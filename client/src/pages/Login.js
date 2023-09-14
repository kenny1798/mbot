import React, { useState, useContext} from 'react';
import axios from '../api/axios';
import { LOGIN_URL } from '../api/url';
import { useAuthContext } from '../hooks/useAuthContext';
import { useValidContext } from '../hooks/useValidContext';
import { useLocation, useNavigate } from 'react-router-dom';

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const {dispatch} = useAuthContext();
  const {validator} = useValidContext();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/";

  const login = () => {

    const data = { username: username, password: password };
    axios.post(LOGIN_URL, data).then( async (response) => {
      const json = await response.data;
      const valtoken = await response.data.valToken;
      if (response.data.error) {
          setErrMsg(json.error)
        }else{
          if(!json.valToken){
          localStorage.setItem("accessToken", JSON.stringify(json))
          dispatch({type: 'LOGIN', payload: json})
        }else{
          localStorage.setItem("accessToken", JSON.stringify({token: json.token, username: json.username}))
          dispatch({type: 'LOGIN', payload: json})
          localStorage.setItem("validToken", JSON.stringify(valtoken))
          validator({type: 'VALIDATE', payload: valtoken})
          navigate(from, {replace:true})
        }
        }
    }).then((response) => {
      if(response){
        const reload = () => {
          window.location.reload()
        }
        setTimeout(reload, 1000)       
      }
      
    })
  };

  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center">
        <div className="col-lg-12">
        <h1 className="my-4 header-title text-center">SIGN IN</h1>
        </div>
        <div className='col-md-5'>
          <label>Username</label>
          <input type="text" className='form-control shadow-none' onChange={(event) => {setUsername(event.target.value)}} />
          <label className='mt-3'>Password</label>
          <input type="password" className='form-control shadow-none' onChange={(event) => {setPassword(event.target.value)}}  />
          <div className="d-grid gap-2 my-4">
            <button className="btn btn-primary mt-3" onClick={login}>Sign In</button>
          </div>
          {!errMsg ?(<></>):(
                    <>
                <div class="alert alert-danger" role="alert">
                    {errMsg}
                </div>
                    </>
                )}
          <p className='my-4 text-center'>Doesnt Have An Account Yet? | <a className='link' href='/signup'>Sign Up Now!</a></p>
          </div>
        </div>  
        </div>
      </div>
 )
}

export default Login