import React from 'react';
import { Link } from 'react-router-dom';
import './Homepage.css';

const Homepage = () => {
  const userProgress = {
    workoutsCompleted: parseInt(localStorage.getItem('workoutsCompleted') || '0'),
    caloriesBurned: parseInt(localStorage.getItem('caloriesBurned') || '0'),
    weeklyGoal: 5,
    monthlyGoal: 20
  };

  // Sample weekly data
  const weeklyData = [
    { day: 'Mon', workouts: 2, calories: 450 },
    { day: 'Tue', workouts: 1, calories: 300 },
    { day: 'Wed', workouts: 3, calories: 600 },
    { day: 'Thu', workouts: 2, calories: 400 },
    { day: 'Fri', workouts: 1, calories: 350 },
    { day: 'Sat', workouts: 2, calories: 500 },
    { day: 'Sun', workouts: 1, calories: 250 }
  ];

  // Function to reset counters
  const resetCounters = () => {
    localStorage.setItem('workoutsCompleted', '0');
    localStorage.setItem('caloriesBurned', '0');
    window.location.reload();
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

        {/* Weekly Progress */}
        <section className="weekly-progress">
          <h2>Weekly Progress</h2>
          <div className="weekly-graphs">
            {/* Workouts Graph */}
            <div className="graph-container">
              <h3>Workouts Completed</h3>
              <div className="progress-graph">
                {weeklyData.map((day, index) => (
                  <div key={index} className="bar-wrapper">
                    <div 
                      className={`graph-bar ${index === weeklyData.length - 1 ? 'active' : ''}`}
                      style={{ 
                        height: `${(day.workouts / maxWorkouts) * 150}px`,
                        backgroundColor: index === weeklyData.length - 1 ? '#4CAF50' : 'rgba(76, 175, 80, 0.6)'
                      }}
                    >
                      <span className="bar-value">{day.workouts}</span>
                    </div>
                    <span className="bar-label">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calories Graph */}
            <div className="graph-container">
              <h3>Calories Burned</h3>
              <div className="progress-graph">
                {weeklyData.map((day, index) => (
                  <div key={index} className="bar-wrapper">
                    <div 
                      className={`graph-bar ${index === weeklyData.length - 1 ? 'active' : ''}`}
                      style={{ 
                        height: `${(day.calories / maxCalories) * 150}px`,
                        backgroundColor: index === weeklyData.length - 1 ? '#4CAF50' : 'rgba(76, 175, 80, 0.6)'
                      }}
                    >
                      <span className="bar-value">{day.calories}</span>
                    </div>
                    <span className="bar-label">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

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
