import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Student from './Student'

function App() {
 const[name,setName]=useState("")
 const[email,setEmail]=useState("")
 const[password,setPassword]=useState("")
  function Show(){
    if(name===""|| email===""||password===""){
      alert("please fill details")
    }
    else{
      alert("registered sucessful")
    }
  }
  {/*
  
    */}

  return (
    <>
    <h1>Registration Form</h1>
     <input type="text" placeholder="Enter Your Name" onChange={(e)=>setName(e.target.value)}/><br/>
     <input type="text" placeholder="Enter Your Email Id"onChange={(e)=>setEmail(e.target.value)}/><br/>
     <input type="text" placeholder="Enter Your Password" onChange={(e)=>setPassword(e.target.value)}/><br/>
     <h2>{name}</h2>
     <h2>{email}</h2>
     <h2>{password}</h2>
     <button onClick={Show}>Submit</button>
     {/*
    
    
    
   
     

   
    <iframe src="https://www.youtube.com/embed/CVcjdrtBHJ4" allowFullScreen></iframe>
    <iframe src="https://www.youtube.com/embed/OMoU0Pfibc4?list=RDGMEMPipJmhsMq3GHGrfqf4WIqA&start_radio=1&rv=JWERWSHJlzo" allowFullScreen></iframe>\
    <audio controls>
      <source src="" type="audio/mp3/"></source>
    </audio>
    <video controls>
      <source src="" type="video/mp4/"></source>
    </video>
    <p>Welcome to my webpages of ABESEC</p>
    <p>Hello</p>
    <h2>CSE-13</h2>
    <img src="https://images.pexels.com/photos/37290569/pexels-photo-37290569.jpeg" width="500" height="500"></img><br></br>
    <button>Click Me</button>
    */}
 
    </>
  )
}

export default App