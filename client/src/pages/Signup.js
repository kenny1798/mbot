import React from 'react';
import RegisterPage from './parts/RegisterPage';

function Signup() {
  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <RegisterPage/>
        </div>
      </div>
    </div>
    </div>
  )
}

export default Signup