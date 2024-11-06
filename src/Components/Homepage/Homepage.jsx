import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Homepage.css';

const Homepage = () => {
  const [weeklyData, setWeeklyData] = useState(() => {
    // Initialize or get weekly data from localStorage
    const storedData = localStorage.getItem('weeklyData');
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    // Default structure for weekly data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
    const adjustedToday = today === 0 ? 6 : today - 1; // Convert to 0 = Monday, 6 = Sunday

    return days.map((day, index) => ({
      day,
      workouts: 0,
      calories: 0,
      isToday: index === adjustedToday
    }));
  });

  // Get latest values from localStorage
  const [workoutsCompleted, setWorkoutsCompleted] = useState(
    parseInt(localStorage.getItem('workoutsCompleted') || '0')
  );
  const [caloriesBurned, setCaloriesBurned] = useState(
    parseInt(localStorage.getItem('caloriesBurned') || '0')
  );

  const userProgress = {
    workoutsCompleted: workoutsCompleted,
    caloriesBurned: caloriesBurned,
    weeklyGoal: 5,
    monthlyGoal: 20
  };

  // Update state when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newWorkouts = parseInt(localStorage.getItem('workoutsCompleted') || '0');
      const newCalories = parseInt(localStorage.getItem('caloriesBurned') || '0');
      
      setWorkoutsCompleted(newWorkouts);
      setCaloriesBurned(newCalories);

      // Update today's data in weeklyData
      setWeeklyData(prevData => {
        return prevData.map(day => {
          if (day.isToday) {
            return {
              ...day,
              workouts: newWorkouts,
              calories: newCalories
            };
          }
          return day;
        });
      });
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Check for updates every second
    const interval = setInterval(() => {
      handleStorageChange();
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Save weekly data to localStorage whenever it changes
    localStorage.setItem('weeklyData', JSON.stringify(weeklyData));
  }, [weeklyData]);

  // Function to reset counters
  const resetCounters = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();
    const adjustedToday = today === 0 ? 6 : today - 1;

    const newWeeklyData = days.map((day, index) => ({
      day,
      workouts: 0,
      calories: 0,
      isToday: index === adjustedToday
    }));

    setWeeklyData(newWeeklyData);
    setWorkoutsCompleted(0);
    setCaloriesBurned(0);
    
    // Reset localStorage values
    localStorage.setItem('weeklyData', JSON.stringify(newWeeklyData));
    localStorage.setItem('workoutsCompleted', '0');
    localStorage.setItem('caloriesBurned', '0');
  };

  // Calculate max values for scaling
  const maxWorkouts = Math.max(...weeklyData.map(d => d.workouts));
  const maxCalories = Math.max(...weeklyData.map(d => d.calories));

  return (
    <div className="homepage-container">
      {/* Background Effect */}
      <div className="background">
        {[...Array(20)].map((_, index) => (
          <span key={index} className={`circle-${index}`}></span>
        ))}
      </div>

      {/* Main Content */}
      <main className="main-content">

        {/* Fitness App Logo */}
        <div className="app-logo">
          <img src= "/fitnessApp_logo.png" alt="Fitness App Logo" className="logo" /> 
        </div>

        {/* Welcome Message Backdrop */}
        <div className="welcome-backdrop">
          <h1>Welcome back, User!</h1>
          <p>Here's your fitness journey at a glance</p>
          <button onClick={resetCounters} className="reset-button">Reset Progress</button>
        </div>
        {/* Progress Cards */}
        <div className="progress-cards">
          <div className="progress-card">
            <h3>Workouts Completed</h3>
            <div className="progress-circle">
              <span className="progress-number">{userProgress.workoutsCompleted}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${(userProgress.workoutsCompleted/userProgress.monthlyGoal) * 100}%`}}
              ></div>
            </div>
            <p>{userProgress.workoutsCompleted}/{userProgress.monthlyGoal} monthly goal</p>
          </div>

          <div className="progress-card">
            <h3>Calories Burned</h3>
            <div className="progress-circle">
              <span className="progress-number">{userProgress.caloriesBurned}</span>
            </div>
            <p>This week</p>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/workout-manager"><button>Start Workout</button></Link>
            <Link to="/meal-tracker"><button>Log Nutrition</button></Link>
            <Link to="/health-monitoring"><button>View Health Goals</button></Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Homepage;
