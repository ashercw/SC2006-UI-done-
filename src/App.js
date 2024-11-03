import './App.css';
import './styles/common.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { LoadingProvider } from './contexts/LoadingContext';
import ErrorBoundary from './Components/ErrorBoundary/ErrorBoundary';
import Login from './Components/Login/Login';
import Signup from './Components/Signup/Signup';
import About from './Components/About/About';
import Homepage from './Components/Homepage/Homepage';
import MealTracker from './Components/MealTracker/MealTracker';
import WorkoutManager from './Components/WorkoutManager/WorkoutManager';
import Progress from './Components/Progress/Progress';
import Settings from './Components/Settings/Settings';
import SleepTracker from './Components/SleepTracker/SleepTracker';
import HealthMonitoring from './Components/HealthMonitoring/HealthMonitoring';

function App() {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <Router>
          <div className="app-container">
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<About />} />
              <Route path="/homepage" element={<Homepage />} />
              <Route path="/meal-tracker" element={<MealTracker />} />
              <Route path="/workout-manager" element={<WorkoutManager />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/sleep-tracker" element={<SleepTracker />} />
              <Route path="/health-monitoring" element={<HealthMonitoring />} />
            </Routes>
            
            {/* Toast notifications */}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </Router>
      </LoadingProvider>
    </ErrorBoundary>
  );
}

export default App;
