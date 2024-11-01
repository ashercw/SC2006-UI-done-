import React from 'react';
import { Link } from 'react-router-dom';
import './Homepage.css';
import HealthMonitoring from '../HealthMonitoring/HealthMonitoring';

const Homepage = () => {
  // Mock data for demonstration
  const userProgress = {
    workoutsCompleted: 12,
    caloriesBurned: 1500,
    weeklyGoal: 5,
    monthlyGoal: 20
  };

  return (
    <div className="homepage-container">
      {/* Navigation Menu */}
      <nav className="nav-menu">
        <div className="nav-header">
          <h2>FitTrack</h2>
        </div>
        <ul className="nav-links">
          <li className="active">Dashboard</li>
          <li><Link to="/workout-manager">Workouts</Link></li>
          <li><Link to="/meal-tracker">Nutrition</Link></li>
          <li><Link to="/progress">Progress</Link></li>
          <li><Link to="/settings">Settings</Link></li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <h1>Welcome back, User!</h1>
          <p>Here's your fitness journey at a glance</p>
        </header>

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
            <button>View Goals</button>
          </div>
        </section>

        {/* Health Monitoring Section */}
        <HealthMonitoring />
      </main>
    </div>
  );
};

export default Homepage;
