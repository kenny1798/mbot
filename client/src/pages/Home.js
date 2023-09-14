import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { LOGIN_URL } from '../api/url';
import "../App.css";
import Userprofile from './parts/Userprofile';

function Home() {


  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="mt-4 header-title">HOME</h1>
        </div>
        </div>
        <Userprofile />
        </div>
      </div>
  )
}

export default Home