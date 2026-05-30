import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Student from './Student'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <h1>Registration form</h1>
    <input type="text" placeholder="Enter your name"></input><br></br>
    <input type="email" placeholder="Enter your email"></input><br></br>
    <input type="password" placeholder="Enter your password"></input><br></br>
    <button>Submit</button>
    </>
  )
}

export default App