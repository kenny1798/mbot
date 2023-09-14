import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuthContext } from '../../hooks/useAuthContext';

function Userprofile() {


const [userObject, setUserObject] = useState({});
const {user} = useAuthContext();

useEffect(()=> {
    axios.get('/api/user/username', {headers: {
      accessToken:user.token
    }}).then((response) => {
      setUserObject(response.data.user)
    })
  }, [])

  return (
    <div class="page-content page-container" id="page-content">
    <div class="padding">
        <div class="row container d-flex justify-content-center">
<div class="col-xl-8 col-md-12">
                                                <div class="card user-card-full">
                                                    <div class="row m-l-0 m-r-0">
                                                        <div class="col-sm-4 bg-c-lite-green user-profile">
                                                            <div class="card-block text-center text-white">
                                                                <div class="m-b-25">
                                                                    <img src="https://img.icons8.com/external-dreamcreateicons-outline-color-dreamcreateicons/256/external-man-men-lifestyle-dreamcreateicons-outline-color-dreamcreateicons.png" class="img-radius" alt="User-Profile-Image" width="80" />
                                                                </div>
                                                                <h6 class="f-w-600">{userObject.username}</h6>
                                                                <p>{userObject.subscription} member</p>
                                                            </div>
                                                        </div>
                                                        <div class="col-sm-8">
                                                            <div class="card-block">
                                                                <h6 class=" p-b-5 b-b-default f-w-600">Information</h6>
                                                                <div class="row">
                                                                    <div class="col-sm-6 mt-3">
                                                                        <p class="mb-1 f-w-600">Email</p>
                                                                        <h6 class="text-muted f-w-400">{userObject.email}</h6>
                                                                    </div>
                                                                    <div class="col-sm-6 mt-3">
                                                                        <p class="mb-1 f-w-600">Phone</p>
                                                                        <h6 class="text-muted f-w-400">{userObject.phoneNumber}</h6>
                                                                    </div>
                                                                </div>
                                                                <ul class="social-link list-unstyled m-t-40 m-b-10">
                                                                    <li><a href="#!" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="facebook" data-abc="true"><i class="mdi mdi-facebook feather icon-facebook facebook" aria-hidden="true"></i></a></li>
                                                                    <li><a href="#!" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="twitter" data-abc="true"><i class="mdi mdi-twitter feather icon-twitter twitter" aria-hidden="true"></i></a></li>
                                                                    <li><a href="#!" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="instagram" data-abc="true"><i class="mdi mdi-instagram feather icon-instagram instagram" aria-hidden="true"></i></a></li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                             </div>
                                                </div>
                                            </div>
  )
}

export default Userprofile