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
      image: 'https://img.freepik.com/free-vector/gradient-fitness-facebook-cover_23-2149202808.jpg'
    },
    { 
      path: '/meal-tracker',
      name: 'Meal Tracker',
      image: 'https://img.freepik.com/free-photo/healthy-food-table_23-2148095326.jpg'
    },
    { 
      path: '/workout-manager',
      name: 'Workout',
      image: 'https://img.freepik.com/free-photo/woman-doing-fitness-training_23-2149056922.jpg'
    },
    { 
      path: '/health-monitoring',
      name: 'Health',
      image: 'https://img.freepik.com/free-photo/medical-banner-with-heart-rate-line_23-2149611215.jpg'
    },
    { 
      path: '/progress',
      name: 'Progress',
      image: 'https://img.freepik.com/free-vector/gradient-stock-market-concept_23-2149166910.jpg'
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

