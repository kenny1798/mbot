import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import RegisterTextField from './RegisterTextField';
import * as Yup from 'yup';
import axios from '../../api/axios';
import { REGISTER_URL } from '../../api/url';
import {useNavigate} from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useValidContext } from '../../hooks/useValidContext';

function RegisterPage() {

    const initValues = {


        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        phoneNumber: "",
    }

    const validate = Yup.object({
        username: Yup.string().max(15, "Username must be 15 characters and lower").required().matches(/^\S*$/, 'Spaces is not allowed'),
        email: Yup.string().email("Please insert legit email").required(),
        password: Yup.string().min(6, "Your password is too short, must be 6 characters and above").required(),
        confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], "Password does not match").required(),
        phoneNumber: Yup.string().required()
    })

    const {validator} = useValidContext();
    const {dispatch} = useAuthContext();
    const [errMsg, setErrMsg] = useState("");
    let navigate = useNavigate();

    const onSubmit = (values) =>{
        axios.post(REGISTER_URL, values, []).then ( async (response) =>{
            const json = await response.data;
            const valtoken = await response.data.valToken;
            if (json.error) {
                setErrMsg(json.error)
              }else if (!json.token2){
                localStorage.setItem("accessToken", JSON.stringify(json))
                dispatch({type: 'LOGIN', payload: json})
                localStorage.setItem("validToken", JSON.stringify(valtoken))
                validator({type: 'VALIDATE', payload: valtoken})
              }else{
                localStorage.setItem("accessToken", JSON.stringify(json))
                dispatch({type: 'LOGIN', payload: json})
                localStorage.setItem("validToken", JSON.stringify(valtoken))
                validator({type: 'VALIDATE', payload: valtoken})
              }
        })
    }

  return (
    <Formik initialValues={initValues} validationSchema={validate} onSubmit={onSubmit} >
        {formik => (
            <div>
                <h1 className="my-4 font-weight-bold-display-4">Sign Up</h1>
                {!errMsg ?(<></>):(
                    <>
                <div class="alert alert-danger" role="alert">
                    {errMsg}
                </div>
                    </>
                )}
                <Form>
                    <RegisterTextField label="Username" name="username" type="text" />
                    <RegisterTextField label="Password" name="password" type="password" />
                    <RegisterTextField label="Password Confirmation" name="confirmPassword" type="password" />
                    <RegisterTextField label="Email" name="email" type="email" />
                    <RegisterTextField label="Mobile Number" name="phoneNumber" type="number" placeholder="e.g: 010337****" />
                    <div class="d-grid gap-2 mt-4">
                    <button className="btn btn-success" type="submit">Register Now</button>
                    </div>
                    <div class="d-grid gap-2 mt-3">
                    <button className="btn btn-outline-danger btn-sm" type="reset">Reset</button>
                    </div>
                    
                </Form>
            </div>
        )}
    </Formik>
  )
}

export default RegisterPage