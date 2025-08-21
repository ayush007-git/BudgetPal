import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/Landingpage'; 
import Login from './pages/Login';
import Signup from './pages/Signup'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
        
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/login" element={<Login />} />
          
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/home" element={<Navigate to="/" replace />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;