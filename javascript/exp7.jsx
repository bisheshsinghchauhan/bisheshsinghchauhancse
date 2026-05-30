import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Student from './Student'
function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h2>Student Information</h2>
      <Student name="Ram" course="B.Tech" marks="90"/>
      <Student name="Raj" course="M.Tech" marks="96"/>
      <Student name="Rohan" course="MCA" marks="98"/>
      {/*
      <video controls>
        <source src="" type="video/mp4/"></source>
      </video>
      <audio controls>
        <source src="" type="audio/mp3/"></source>
      </audio>
      <iframe src="https://www.youtube.com/embed/vHt_tCREXbY" allowFullScreen></iframe>
      <iframe src="https://www.youtube.com/embed/LW_Yj80rlv4" allowFullScreen></iframe>
    <img src="https://images.pexels.com/photos/20447506/pexels-photo-20447506.jpeg" width="1000" height="500"></img><br></br>
    <button>Click Me</button>
    <h1>My Web Page of  ABES</h1>
    <h2>Hello Everyone</h2>
    <h3>hello</h3>
    <p>Hello Rohit Sir</p>
    <h1>vgjgjgjhjjhjjb</h1>
    <p>rrrrrrrrrrrrrrr</p>
    */}
    <Student/>
    </div>
  )
}

export default App