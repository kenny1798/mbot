import React, { useEffect } from 'react'

function NotFound({setNavbar, props}) {

    useEffect(() => {
        setNavbar(false);
    })

  return (
    <div>
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className='mt-4 mgen-header-title'>404</h1>
        <p>Page not found</p></div>
        </div>
        </div>
        </div>
        </div>
        
  )
}

export default NotFound