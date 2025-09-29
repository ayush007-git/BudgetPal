import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BudgetPalLanding from './pages/LandingPage'; 
import Login from './pages/Login';
import Signup from './pages/Signup'; 
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<BudgetPalLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;