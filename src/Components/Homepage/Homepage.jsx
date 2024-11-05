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

  // Function to reset counters
  const resetCounters = () => {
    localStorage.setItem('workoutsCompleted', '0');
    localStorage.setItem('caloriesBurned', '0');
    window.location.reload();
  };

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
          <div className="progress-graph">
            <div className="graph-bar" style={{height: '60%'}}></div>
            <div className="graph-bar" style={{height: '80%'}}></div>
            <div className="graph-bar" style={{height: '40%'}}></div>
            <div className="graph-bar" style={{height: '90%'}}></div>
            <div className="graph-bar" style={{height: '70%'}}></div>
            <div className="graph-bar" style={{height: '50%'}}></div>
            <div className="graph-bar active" style={{height: '75%'}}></div>
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
