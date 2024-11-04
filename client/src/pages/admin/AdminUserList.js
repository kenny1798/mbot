import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { useAdminContext } from '../../hooks/useAdminContext';

function AdminUserList({setNavbar, props}) {

  const {admin} = useAdminContext();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setNavbar(false);
})

useEffect(() => {
axios.get('/api/admin/getuser', {headers:{
  adminToken: admin.token.adminToken
}}).then((response) => {
  setUsers(response.data)
})
} , [])
  
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-12 mb-4">
        <h1 className="mt-4 header-title text-center">USERS LIST</h1>
        </div>
        </div>
        <div className='row justify-content-center mt-3'>
          <div className='col-lg-12 text-center'>
          <input type="text" className='form-control shadow-none my-3' placeholder='Search user...' onChange={(event) =>{setSearch(event.target.value)}}/>
            <table class="table table-hover table-light">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Username</th>
      <th scope="col">Email</th>
      <th scope="col">PhoneNumber</th>
      <th scope="col">Action</th>
    </tr>
  </thead>
{users.filter((value) => {
  return search.toLowerCase() === '' ? value : value.username.toLowerCase().includes(search);
}).map((value, key) => {

const link = '/admin/users/edit/' + value.username;

  return (
  <tbody>
    <tr>
      <th scope="row">{key+1}</th>
      <td>{value.username}</td>
      <td>{value.email}</td>
      <td>{value.phoneNumber}</td>
      <td><Link className='btn btn-sm btn-primary' to={link}>Edit</Link></td>
    </tr>
  </tbody>
  )})}
</table>
            </div>
          </div>
          </div>
  )
}

export default AdminUserList