import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuthContext } from '../../hooks/useAuthContext';
import { Link, useNavigate } from 'react-router-dom';

function Mbot() {
  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="mt-4 header-title">M-Bot</h1>
        <p>WhatsApp Automation</p>
        </div>
        </div>

        <div className='row justify-content-center text-center mb-2'>
    <div className="col-md-8">
    <div className="d-grid my-4 gap-2">
      <h2>Step 1:</h2>
        <Link className='btn btn-lg btn-success' to='/mbot/auth'>Connect WhatsApp</Link>
        </div>
        <br/>
        <div className="d-grid my-4 gap-2">
        <h2>Step 2:</h2>
        <Link className='btn btn-lg btn-primary' to='/mbot/flow'>Manage Flow</Link>
        </div>
        <br/>
        <div className="d-grid my-4 gap-2">
        <h2>Step 3:</h2>
        <Link className='btn btn-lg btn-primary' to='/mbot/campaign'>Manage Campaign</Link>
        </div>
  </div>
  </div>
  </div>
  </div>
  )
}

export default Mbot