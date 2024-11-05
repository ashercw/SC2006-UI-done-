import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MenuPopup.css';

const MenuPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // State to track logout
  const navigate = useNavigate();
  const location = useLocation();

  const routes = [
    { 
      path: '/Homepage',
      name: 'Homepage',
      image: 'https://img.freepik.com/premium-vector/world-health-day-hand-drawn-set_98292-30408.jpg'
    },
    { 
      path: '/meal-tracker',
      name: 'Meal Tracker',
      image: 'https://img.freepik.com/premium-vector/three-plates-food-with-glass-juice_850687-823.jpg'
    },
    { 
      path: '/workout-manager',
      name: 'Workout',
      image: 'https://img.freepik.com/free-vector/gym-concept-illustration_114360-6550.jpg'
    },
    { 
      path: '/health-monitoring',
      name: 'Health',
      image: 'https://img.freepik.com/free-vector/illustration-pulse-rate_53876-5594.jpg'
    },
    { 
      path: '/progress',
      name: 'Progress',
      image: 'https://img.freepik.com/free-vector/leadership-teamwork-concept_74855-14094.jpg'
    },
    { 
      path: '/posture-correction',
      name: 'Posture Correction',
      image: 'https://img.freepik.com/premium-vector/set-young-woman-posture-problems_140689-8026.jpg'
    },
    {
      path: '/settings',
      name: 'Settings',
      image: 'https://miro.medium.com/v2/resize:fit:1400/1*wu3FKUzPxQhjf4Wk_uCJIw.png'
    },
    {
      path: '/login',
      name: 'Logout',
      image: 'https://static.vecteezy.com/system/resources/previews/010/925/681/non_2x/enter-login-and-password-registration-page-on-screen-sign-in-to-your-account-creative-metaphor-login-page-mobile-app-with-user-page-identification-in-internet-vector.jpg'
    }
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    document.body.dataset.menu = !isOpen ? "true" : "false";
    document.body.style.overflow = !isOpen ? "hidden" : "";
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
    document.body.dataset.menu = "false";
    document.body.style.overflow = "";
  };

  // Handle logout with a delay
  const handleLogout = () => {
    setIsLoggingOut(true); // Show the spinner

    // Simulate delay for logout process (e.g., show loading spinner)
    setTimeout(() => {
      // Clear any stored user data (optional)
      localStorage.clear();
      // Navigate to the login page after delay
      navigate('/login');
      setIsLoggingOut(false); // Hide the spinner after navigating
    }, 1500); // 1.5 second delay
  };

  return (
    <>
      <button id="menu-toggle" onClick={toggleMenu}>
        <i className="open fa-solid fa-bars"></i>
        <i className="close fa-solid fa-xmark"></i>
      </button>

      <nav id="menu">
        <div id="menu-links">
          {routes
            .filter(route => route.path !== location.pathname)
            .map(route => (
              <button
                key={route.path}
                className="menu-link"
                onClick={() => route.path === '/login' ? handleLogout() : handleNavigate(route.path)} // Check for logout
              >
                <h2 className="menu-link-label">{route.name}</h2>
                <img 
                  className="menu-link-image" 
                  src={route.image}
                  alt={route.name}
                />
              </button>
            ))}
        </div>
      </nav>

      {isLoggingOut && (
        <div className="logout-spinner-container">
          <div className="spinner"></div>
          <p>Logging out...</p>
        </div>
      )}
    </>
  );
};

export default MenuPopup;

