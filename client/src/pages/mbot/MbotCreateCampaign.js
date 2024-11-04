import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';

function MbotCreateCampaign() {

  useEffect(() => {
    axios.get('/api/broadcast/get/flowname/', {headers: {
      accessToken: user.token
    }}).then((response) => {
      setFlow(response.data)
      setInputContent(response.data[0].flowName)
    })
  }, [])

  const dateNow = new Date();

  const {user} = useAuthContext();
  const [campaignName, setCampaignName] = useState("");
  const [excelFile, setExcelFile] = useState("")
  const [msgInterval, setMsgInterval] = useState(240);
  const [isSchedule, setIsSchedule] = useState(0);
  const [flow, setFlow] = useState([])
  const [inputContent, setInputContent] = useState("");
  const [scheduleDate, setScheduleDate] = useState(dateNow.toISOString());
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()

  

  const toggleSchedule = () => {
    if(isSchedule == 0){
      setIsSchedule(1)
    }else{
      setIsSchedule(0)
      setScheduleDate(dateNow.toISOString());
    }
  }

  const delayNav = () => {
    navigate('/mbot/campaign', {replace:true})
  }

  const submitCampaign = (e) => {
    e.preventDefault();
    const formData = new FormData()
    formData.append('campaignName', campaignName);
    formData.append('excelFile', excelFile);
    formData.append('msgInterval', msgInterval);
    formData.append('isSchedule', isSchedule);
    formData.append('inputContent', inputContent);
    formData.append('scheduleDate', scheduleDate);
    axios.post('/api/broadcast/create/campaign', formData, {headers:{
      accessToken:user.token
    }}).then((response) => {
      if(response.data.success){
        setTimeout(delayNav, 6000)
        setSuccess(response.data.success)
      }
    })
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
    <div className='card'>
      <div className="card-header text-center">
    <form encType='multipart/form-data'>
  <div className='container'>
  {!success ? (<></>): (<div class="alert alert-success" role="alert">
  Campaign created successfully
</div>)}
  <div className='row justify-content-center'>
  <div className='col-sm-6'>
  <label className='mt-5'><strong>Campaign Name</strong></label><br/>
          <input type="text" className='form-control shadow-none' onChange={(event) => {setCampaignName(event.target.value)}}/>
          <label className='mt-5'><strong>Excel File</strong></label>
          <input type="file" className='form-control shadow-none' onChange={(event) => {setExcelFile(event.target.files[0])}} />
          <label className='mt-5'><strong>Message Interval</strong></label>
          <input className='form-control shadow-none' type="range" min="30" max="300" onChange={(event) => {setMsgInterval(event.target.value)}}/>{msgInterval} Second<br/>
          <label className='mt-5'><strong>Flow</strong></label>
          <select className='form-control shadow-none' onChange={(event) => {setInputContent(event.target.value)}} >
          {flow.map((value, key) => {
            return(<option value={value.flowName}>{value.flowName}</option>)
            })}
          </select>
<input type="checkbox" className='mt-5' onClick={toggleSchedule} />
          <label className='mx-5 '>Schedule?</label><br></br>
          {isSchedule == 0 ? (<></>): (<>
            <label className='mt-5'><strong>Schedule Date</strong></label>
            <input className='form-control shadow-none' type="datetime-local" onChange={(event) => {setScheduleDate(event.target.value)}} />
          </>)}
          
          <div className="d-grid my-3 gap-2">
          <button className='btn btn-primary mt-2' onClick={submitCampaign}>Submit Block</button>
          </div>

          
          
          
  </div>
  {!success ? (<></>): (<div class="alert alert-success" role="alert">
  Campaign created successfully
</div>)}
  
  </div>
  </div>
</form>
</div>
</div>
</div>
    </div>
    </div>
    </div>
  )
}

export default MbotCreateCampaign
