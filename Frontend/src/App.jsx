import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BudgetPalLanding from './pages/LandingPage'; 
import Login from './pages/Login';
import Signup from './pages/Signup'; 
import Dashboard from './pages/Dashboard';
import CreateGroup from './pages/CreateGroup';
import GroupDetails from './pages/GroupDetails';
import Settlement from './pages/Settlement';
import AllSettlements from './pages/AllSettlements';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import AddExpense from './pages/AddExpense';
import Chat from './pages/Chat';
import { ToastProvider } from './components/ToastProvider';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<BudgetPalLanding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-group" element={<CreateGroup />} />
            <Route path="/group/:groupId" element={<GroupDetails />} />
            <Route path="/settlement/:groupId" element={<Settlement />} />
            <Route path="/chat/:groupId" element={<Chat />} />
            <Route path="/all-settlements" element={<AllSettlements />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/group/:groupId/add-expense" element={<AddExpense />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;