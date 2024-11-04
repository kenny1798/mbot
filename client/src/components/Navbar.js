import { Link } from "react-router-dom";
import logo from './logo.png';
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";

function Navbar() {

  const {logout} = useLogout()
  const {user} = useAuthContext()

  const handleClick = () => {
    logout()
  }
  

  return(

<div className="topnav">
        <div className='topnav-conteiner conteiner'>
        <img alt='Mirads Marketing' className='logo' src={logo} width="150" />
        <input type="checkbox" name="" id="" />
          <div class="hamburger-lines">
              <span class="line line1"></span>
              <span class="line line2"></span>
              <span class="line line3"></span>
          </div>
          <div className="menu-items">

        {!user && (<>
        <Link to="/login">Login</Link>
        <Link to="/signup">Sign Up</Link>
        </>)}
        {user && (<>
        <Link to="/">Home</Link>
        <Link to="/mbot">M-Bot</Link>
        <Link onClick={handleClick} to="/login">Logout ({user.username})</Link>   
        </>)}
        </div>
        </div>
      </div>
)}

export default Navbar