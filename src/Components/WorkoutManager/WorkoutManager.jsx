import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './WorkoutManager.css';

const WorkoutManager = () => {
  const [workouts, setWorkouts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workoutForm, setWorkoutForm] = useState({
    type: '',
    duration: '',
    intensity: 'medium',
    notes: ''
  });

  // Calculate calories based on intensity and duration
  const calculateCalories = (duration, intensity) => {
    const caloriesPerMinute = {
      low: 5,      // 5 calories per minute
      medium: 7,   // 7 calories per minute
      high: 10     // 10 calories per minute
    };
    return duration * caloriesPerMinute[intensity];
  };

  // Get weekly summary
  const getWeeklySummary = () => {
    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((acc, curr) => acc + parseInt(curr.duration), 0);
    const totalCalories = workouts.reduce((acc, curr) => 
      acc + calculateCalories(parseInt(curr.duration), curr.intensity), 0
    );
    
    return {
      totalWorkouts,
      totalDuration: `${Math.floor(totalDuration/60)}h ${totalDuration%60}m`,
      averageIntensity: 'Medium',
      completedGoals: '3/4',
      totalCalories
    };
  };

  const weeklySummary = getWeeklySummary();

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setWorkoutForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newWorkout = {
      ...workoutForm,
      date: selectedDate,
      id: Date.now()
    };
    setWorkouts(prev => [...prev, newWorkout]);

    // Increment workouts completed counter
    const currentCount = parseInt(localStorage.getItem('workoutsCompleted') || '0');
    localStorage.setItem('workoutsCompleted', currentCount + 1);

    // Update calories burned
    const calories = calculateCalories(parseInt(workoutForm.duration), workoutForm.intensity);
    const currentCalories = parseInt(localStorage.getItem('caloriesBurned') || '0');
    localStorage.setItem('caloriesBurned', currentCalories + calories);
    
    setWorkoutForm({
      type: '',
      duration: '',
      intensity: 'medium',
      notes: ''
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="posture-track-background">
      <div className="app-header">    
        <img src="/fitnessApp_logo.png" alt="Fitness App Logo" className="logo" />         
      </div>
      <div className="workout-manager">
        <h1>Workout Manager</h1>
        
        <div className="workout-container">
          <div className="calendar-section">
            <h2>Schedule Workouts</h2>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              className="workout-calendar"
            />
          </div>

          <div className="tracking-section">
            <h2>Track Workout</h2>
            <form onSubmit={handleSubmit} className="workout-form">
              <div className="form-group">
                <label>Workout Type:</label>
                <input
                  type="text"
                  name="type"
                  value={workoutForm.type}
                  onChange={handleFormChange}
                  placeholder="e.g., Running, Weightlifting"
                  required
                />
              </div>

              <div className="form-group">
                <label>Duration (minutes):</label>
                <input
                  type="number"
                  name="duration"
                  value={workoutForm.duration}
                  onChange={handleFormChange}
                  placeholder="Duration in minutes"
                  required
                />
              </div>

              <div className="form-group">
                <label>Intensity:</label>
                <select
                  name="intensity"
                  value={workoutForm.intensity}
                  onChange={handleFormChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notes:</label>
                <textarea
                  name="notes"
                  value={workoutForm.notes}
                  onChange={handleFormChange}
                  placeholder="Add any notes about your workout"
                />
              </div>

              <button type="submit" className="submit-btn">Log Workout</button>
            </form>
          </div>

          <div className="summary-section">
            <h2>Weekly Summary</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <h3>Total Workouts</h3>
                <p>{weeklySummary.totalWorkouts}</p>
              </div>
              <div className="summary-item">
                <h3>Total Duration</h3>
                <p>{weeklySummary.totalDuration}</p>
              </div>
              <div className="summary-item">
                <h3>Average Intensity</h3>
                <p>{weeklySummary.averageIntensity}</p>
              </div>
              <div className="summary-item">
                <h3>Calories Burned</h3>
                <p>{weeklySummary.totalCalories}</p>
              </div>
            </div>
          </div>

          <div className="workouts-list-section">
            <h2>Logged Workouts</h2>
            {workouts.length === 0 ? (
              <p>No workouts logged yet</p>
            ) : (
              <div className="workouts-list">
                {workouts.map(workout => (
                  <div key={workout.id} className="workout-item">
                    <h3>{workout.type}</h3>
                    <p>Date: {formatDate(workout.date)}</p>
                    <p>Duration: {workout.duration} minutes</p>
                    <p>Intensity: {workout.intensity}</p>
                    <p>Calories: {calculateCalories(parseInt(workout.duration), workout.intensity)}</p>
                    {workout.notes && <p>Notes: {workout.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutManager;
