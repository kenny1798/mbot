import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuthContext } from '../../hooks/useAuthContext';
import logo from '../../components/logo.png';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-modal';



function MbotCreateBlock() {

  const {id} = useParams();

  useEffect(() => {
    axios.get(`/api/broadcast/get/flow/${id}`, {headers:{
      accessToken: user.token
    }}).then((response) => {
      setFlowBlocks(response.data)
      axios.get(`/api/broadcast/get/flowname/${id}`, {headers: {
        accessToken: user.token
      }}).then((response) => {
        setFlowName(response.data)
      })
    })
  }, [])


  const {user} = useAuthContext();
  const [error, setError] = useState("");
  const [flowBlocks, setFlowBlocks] = useState([])
  const [flowName, setFlowName] = useState("");
  const [contentType, setContentType] = useState("Text");
  const [content, setContent] = useState("");
  const [isDelay, setIsDelay] = useState(0);
  const [delayPeriod, setDelayPeriod] = useState(0);
  const [buttonText, setButtonText] = useState("Add Blocks");
  const [showBtn, setShowBtn] = useState(true);
  const sortedFlow = flowBlocks.sort((a,b) => a.delayPeriod - b.delayPeriod);

  const addBlocks = () => {
    setShowBtn(false);
    setButtonText("Cancel");
  }

  const cancelAdd = () => {
    setShowBtn(true)
    setButtonText("Add Blocks")
  }

  const submitBlock = () => {
    const formData = new FormData()
    formData.append('flowName', flowName);
    formData.append('contentType', contentType);
    formData.append('content', content);
    formData.append('isDelay', isDelay);
    formData.append('delayPeriod', delayPeriod);
    axios.post('/api/broadcast/create/flow/block', formData, {headers:{
      accessToken:user.token
    }}).then(() => {
      setShowBtn(true)
    setButtonText("Add Blocks")
    })
  }
  
  const deleteBlock = (id) => {
    axios.get(`/api/broadcast/delete/flow/block/${id}`, {headers:{
      accessToken:user.token
    }}).then((response) => {
      if(response.data){
        window.location.reload()
      }
    })
  }
  

  const toggleSchedule = () => {
    if(isDelay == 0){
      setIsDelay(1)
    }else{
      setIsDelay(0)
    }
  }

  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="mt-4 header-title">M-BOT</h1>
        </div>
        </div>
    <div className='row justify-content-center'>
    <div className="col-sm-8">
  {sortedFlow.map((value, key) => {

    const image = process.env.REACT_APP_SERVER + value.content;
    console.log(image)
    return (
      <div className='row justify-content-center'>
      <div className="col-sm-8">
    <div className='card text-center'>
    <div className='mt-2'><strong >Chat {key+1}:</strong></div>
    {value.contentType === 'Text' ? (<div style={{whiteSpace: 'pre-wrap'}}>{value.content}</div>) : value.contentType === 'Image' ? (
      <img src={image} alt='image' className='mgen-image-header'/>
    ) : value.contentType === 'Video' && (
  <video className='justify-content-center' width="320" height="240" src={image} controls />
    )}
    <div className='d-flex justify-content-between'>
      <div className='my-2 mx-2' style={{color: '#454545', fontSize:'0.8rem'}}>
      Delay: {value.delayPeriod}sec
      </div>
      <div><button className='btn btn-sm btn-danger text-end my-2 mx-2' onClick={() => {deleteBlock(value.id)}}>Delete</button></div>
      </div>
    </div>
    
    </div>
    </div>
    )
  })}

  {showBtn == true ? (<></>) : (<div className='card'>
  <div className='row justify-content-center'>
    <div className="col-md-8">
    <form encType='multipart/form-data'>
  <div className='container'>
  <div className='row justify-content-center'>
  <div className='col-md-8'>
          <label className='mt-5'><strong>Content Type</strong></label>
          <select className='form-control shadow-none' onChange={(event) => {setContentType(event.target.value)}} required>
  <option value="Text">Text</option>
  <option value="Image">Image</option>
  <option value="Video">Video</option>
</select>

          {contentType == 'Text' ? (<><label className='mt-5'><strong>Text Content</strong></label>
          <textarea style={{whiteSpace: 'pre-wrap'}} type="textarea" className='form-control shadow-none' onChange={(event) => {setContent(event.target.value)}} required maxLength="254" /></>) : (<><label className='mt-5'><strong>File Content</strong></label>
          <input type="file" className='form-control shadow-none' onChange={(event) => {setContent(event.target.files[0])}}></input></>)}
          <input type="checkbox" className='mt-5' onClick={toggleSchedule} />
          <label className='mx-5 '>Delay?</label><br></br>
          {isDelay == 0 ? (<></>) : (<div><label className='mt-5'>Delay Period</label><br/>
          <input type="number" onChange={(event) => {setDelayPeriod(event.target.value)}}/> Sec</div>)}
          
          <div className="d-grid my-3 gap-2">
          <button className='btn btn-primary mt-2' onClick={submitBlock}>Submit Block</button>
          </div>
          
          
  </div>
  </div>
  </div>
</form>
</div>
    </div>
    </div>)}

{showBtn == true ? (<div className="d-grid mx-5 my-3 gap-2">
          <button className='btn btn-lg btn-primary mt-2'onClick={addBlocks}><strong>{buttonText}</strong></button>
          </div>) : (<div className="d-grid mx-5 my-3 gap-2">
          <button className='btn btn-lg btn-secondary mt-2'onClick={cancelAdd}><strong>{buttonText}</strong></button>
          </div>)}

  
    </div>
    </div>
    </div>
    </div>
  )
}

export default MbotCreateBlock