import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MenuPopup.css';

const MenuPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const routes = [
    { 
      path: '/homepage',
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
    }
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    document.body.dataset.menu = !isOpen ? "true" : "false";
    // Prevent body scroll when menu is open
    document.body.style.overflow = !isOpen ? "hidden" : "";
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
    document.body.dataset.menu = "false";
    document.body.style.overflow = "";
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
                onClick={() => handleNavigate(route.path)}
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
    </>
  );
};

export default MenuPopup;

