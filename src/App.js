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
import HealthMonitoring from './Components/HealthMonitoring/HealthMonitoring';
import MenuPopup from './Components/MenuPopup/MenuPopup';
import { useLocation } from 'react-router-dom';

// Layout wrapper component that includes the MenuPopup
const PageLayout = ({ children }) => {
  const location = useLocation();
  const noMenuPaths = ['/login', '/signup'];
  
  return (
    <div className="page-layout">
      {!noMenuPaths.includes(location.pathname) ? (
        <>
          <link 
            rel="stylesheet" 
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
          />
          <main className="content-wrapper">
            {children}
          </main>
          <MenuPopup />
        </>
      ) : (
        children
      )}
    </div>
  );
};

function App() {
  // Initialize body dataset
  if (typeof document !== 'undefined') {
    document.body.dataset.menu = "false";
  }

  return (
    <ErrorBoundary>
      <LoadingProvider>
        <Router>
          <div className="app-container">
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={
                <PageLayout>
                  <Login />
                </PageLayout>
              } />
              <Route path="/signup" element={
                <PageLayout>
                  <Signup />
                </PageLayout>
              } />
              <Route path="/about" element={
                <PageLayout>
                  <About />
                </PageLayout>
              } />
              <Route path="/homepage" element={
                <PageLayout>
                  <Homepage />
                </PageLayout>
              } />
              <Route path="/meal-tracker" element={
                <PageLayout>
                  <MealTracker />
                </PageLayout>
              } />
              <Route path="/workout-manager" element={
                <PageLayout>
                  <WorkoutManager />
                </PageLayout>
              } />
              <Route path="/progress" element={
                <PageLayout>
                  <Progress />
                </PageLayout>
              } />
              <Route path="/settings" element={
                <PageLayout>
                  <Settings />
                </PageLayout>
              } />
              <Route path="/health-monitoring" element={
                <PageLayout>
                  <HealthMonitoring />
                </PageLayout>
              } />
            </Routes>
            
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
