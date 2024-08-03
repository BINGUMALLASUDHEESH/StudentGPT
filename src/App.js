import React from 'react';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard2 from './components/Dashboard2';
import SignUp2 from './components/SignUp2';
import ChatGPTDashboard from './components/ChatGPTDashboard';
import TextToSpeech from './components/TextToSpeech';
import CountryList from './components/CountryList';
import AudioRecorder from './components/AudioRecorder';


function App() {
  return (
    <div className="App min-h-screen flex flex-col">
      
      <BrowserRouter>
      
      <Routes>

        <Route path='/' element={<Login/>} />
        <Route path='/register' element={<SignUp/>} />
        <Route path='/dashboard' element={<ChatGPTDashboard/>}/>

        <Route path='/countries' element={<CountryList/>} />
        <Route path='/audiototext' element={<AudioRecorder/>} />
       

      </Routes>
      
      </BrowserRouter>


    </div>
  );
}

export default App;





