//Packages import
import React, {useState, useEffect} from 'react';
import {useLocation, Navigate } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { useAuthContext } from './hooks/useAuthContext';
import { useValidContext } from './hooks/useValidContext';
import { useAdminContext } from './hooks/useAdminContext';


//Pages import
import Home from './pages/Home';
import Login from './pages/Login';
import AccAuth from './pages/AccAuth';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';
import NotFound from './pages/NotFound';

//MBot
import Mbot from './pages/mbot/Mbot';
import MbotAuth from './pages/mbot/MbotAuth';
import MbotFlow from './pages/mbot/MbotFlow';
import MbotCampaign from './pages/mbot/MbotCampaign';
import MbotCreateBlock from './pages/mbot/MbotCreateBlock';
import MbotCreateFlow from './pages/mbot/MbotCreateFlow';
import MbotCreateCampaign from './pages/mbot/MbotCreateCampaign';

//Admin
import AdminLogin from './pages/admin/AdminLogin';
import AdminPanel from './pages/admin/AdminPanel';
import AdminWsAuth from './pages/admin/AdminWsAuth';
import AdminUserList from './pages/admin/AdminUserList';
import AdminEditUser from './pages/admin/AdminEditUser';



function App() {

  const { user } = useAuthContext();
  const { valid } = useValidContext();
  const { admin } = useAdminContext();
  const location = useLocation();
  const [showNav, setShowNav] = useState(true);
  

  return (
    <div className='app-content'>
      {showNav ? <Navbar /> : null}
        <Routes>
          
          <Route path='*' element={<NotFound setNavbar={setShowNav} />} />

          <Route path='/login' element={user ? <Navigate to="/" state={{from: location}} replace /> : <Login/>  } />

          <Route path='/signup' element={user ? <Navigate to="/" state={{from: location}} replace /> : <Signup/> } />

          <Route path='/auth' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && valid ? <Navigate to="/" state={{from: location}} replace /> : user && !valid && <AccAuth/> } />

          <Route path='/' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <Home />}/>

          <Route path='/mbot' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <Mbot />}/>

          <Route path='/mbot/auth' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <MbotAuth />}/>

          <Route path='/mbot/flow' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <MbotFlow />}/>

          <Route path='/mbot/campaign' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <MbotCampaign />}/>

          <Route path='/mbot/:id' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <MbotCreateBlock />}/>

          <Route path='/mbot/create/flow' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <MbotCreateFlow />}/>

          <Route path='/mbot/create/campaign' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <MbotCreateCampaign />}/>

          <Route path='/admin/login' element={admin ? <Navigate to="/admin/" state={{from: location}} replace /> : <AdminLogin setNavbar={setShowNav} />} />

          <Route path='/admin/' element={!admin ? <Navigate to="/admin/login" state={{from: location}} replace /> : <AdminPanel setNavbar={setShowNav} />}  />

          <Route path='/admin/wsauth' element={!admin ? <Navigate to="/admin/login" state={{from: location}} replace /> : <AdminWsAuth setNavbar={setShowNav} />} />
          
          <Route path='/admin/users' element={!admin ? <Navigate to="/admin/login" state={{from: location}} replace /> : <AdminUserList setNavbar={setShowNav} />} />

          <Route path='/admin/users/edit/:user' element={!admin ? <Navigate to="/admin/login" state={{from: location}} replace /> : <AdminEditUser setNavbar={setShowNav} />} />

        </Routes>
      
        </div>
      
  );
}

export default App;
