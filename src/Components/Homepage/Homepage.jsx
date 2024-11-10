import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Homepage.css';

const Homepage = () => {
  const [weeklyData, setWeeklyData] = useState(() => {
    const storedData = localStorage.getItem('weeklyData');
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();
    const adjustedToday = today === 0 ? 6 : today - 1;

    return days.map((day, index) => ({
      day,
      workouts: 0,
      calories: 0,
      isToday: index === adjustedToday
    }));
  });

  const [workoutsCompleted, setWorkoutsCompleted] = useState(
    parseInt(localStorage.getItem('workoutsCompleted') || '0')
  );
  const [caloriesBurned, setCaloriesBurned] = useState(
    parseInt(localStorage.getItem('caloriesBurned') || '0')
  );

  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('userSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      notifications: {
        workoutReminders: false,
        mealReminders: false
      }
    };
  });

  const [reminderTimes, setReminderTimes] = useState(() => {
    const savedTimes = localStorage.getItem('reminderTimes');
    return savedTimes ? JSON.parse(savedTimes) : {
      workout: '09:00',
      meal: '12:00'
    };
  });

  useEffect(() => {
    // Listen for settings changes
    const handleStorageChange = (e) => {
      if (e.key === 'userSettings') {
        const newSettings = JSON.parse(e.newValue);
        setSettings(newSettings);
      } else if (e.key === 'reminderTimes') {
        const newTimes = JSON.parse(e.newValue);
        setReminderTimes(newTimes);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const newWorkouts = parseInt(localStorage.getItem('workoutsCompleted') || '0');
      const newCalories = parseInt(localStorage.getItem('caloriesBurned') || '0');
      
      setWorkoutsCompleted(newWorkouts);
      setCaloriesBurned(newCalories);

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

    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(() => {
      handleStorageChange();
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('weeklyData', JSON.stringify(weeklyData));
  }, [weeklyData]);

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
    
    localStorage.setItem('weeklyData', JSON.stringify(newWeeklyData));
    localStorage.setItem('workoutsCompleted', '0');
    localStorage.setItem('caloriesBurned', '0');
  };

  const userProgress = {
    workoutsCompleted: workoutsCompleted,
    caloriesBurned: caloriesBurned,
    weeklyGoal: 5,
    monthlyGoal: 20
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

        {/* Reminders Section */}
        {(settings.notifications?.workoutReminders || settings.notifications?.mealReminders) && (
          <section className="reminders-section">
            <h2>Today's Reminders</h2>
            <div className="reminders-list">
              {settings.notifications?.workoutReminders && (
                <div className="reminder-item">
                  <span className="reminder-icon">🏋️</span>
                  <div className="reminder-content">
                    <h3>Workout Reminder</h3>
                    <p>Scheduled for {reminderTimes.workout}</p>
                  </div>
                </div>
              )}
              {settings.notifications?.mealReminders && (
                <div className="reminder-item">
                  <span className="reminder-icon">🍽️</span>
                  <div className="reminder-content">
                    <h3>Meal Reminder</h3>
                    <p>Scheduled for {reminderTimes.meal}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

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
