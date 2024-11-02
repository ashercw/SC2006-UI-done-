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

  // Mock data for weekly summary
  const weeklySummary = {
    totalWorkouts: 5,
    totalDuration: '5h 30m',
    averageIntensity: 'Medium',
    completedGoals: '3/4'
  };

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
              <h3>Goals Completed</h3>
              <p>{weeklySummary.completedGoals}</p>
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
                  {workout.notes && <p>Notes: {workout.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutManager;
