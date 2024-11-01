import React, { useState } from 'react';
import './Progress.css';

const Progress = () => {
  const [progressData, setProgressData] = useState({
    weight: [],
    workouts: [],
    goals: []
  });

  const [newGoal, setNewGoal] = useState('');
  const [weightEntry, setWeightEntry] = useState('');

  const generateSuggestions = () => {
    const suggestions = [];
    
    // Weight-based suggestions
    if (progressData.weight.length >= 2) {
      const latestWeight = progressData.weight[progressData.weight.length - 1].value;
      const previousWeight = progressData.weight[progressData.weight.length - 2].value;
      const weightDiff = latestWeight - previousWeight;
      
      if (weightDiff > 0) {
        suggestions.push("Your weight has increased. Consider adjusting your caloric intake or increasing cardio exercises.");
      } else if (weightDiff < 0) {
        suggestions.push("Great progress on weight loss! Keep maintaining your current routine.");
      }
    } else if (progressData.weight.length === 0) {
      suggestions.push("Start tracking your weight regularly to get personalized suggestions.");
    }

    // Goals-based suggestions
    const completedGoals = progressData.goals.filter(goal => goal.completed).length;
    const totalGoals = progressData.goals.length;
    
    if (totalGoals === 0) {
      suggestions.push("Set some fitness goals to track your progress better.");
    } else if (completedGoals / totalGoals < 0.3) {
      suggestions.push("Try breaking down your goals into smaller, more achievable tasks.");
    } else if (completedGoals / totalGoals > 0.8) {
      suggestions.push("You're doing great! Consider setting new challenging goals.");
    }

    return suggestions.length > 0 ? suggestions : ["Keep tracking your progress to get personalized suggestions!"];
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setProgressData(prev => ({
        ...prev,
        goals: [...prev.goals, { text: newGoal, completed: false }]
      }));
      setNewGoal('');
    }
  };

  const toggleGoal = (index) => {
    setProgressData(prev => {
      const newGoals = [...prev.goals];
      newGoals[index] = {
        ...newGoals[index],
        completed: !newGoals[index].completed
      };
      return { ...prev, goals: newGoals };
    });
  };

  const addWeight = () => {
    if (weightEntry && !isNaN(weightEntry)) {
      setProgressData(prev => ({
        ...prev,
        weight: [...prev.weight, {
          date: new Date().toISOString().split('T')[0],
          value: parseFloat(weightEntry)
        }]
      }));
      setWeightEntry('');
    }
  };

  return (
    <div className="progress-container">
      <h1>Progress Tracking</h1>
      
      <section className="weight-tracker">
        <h2>Weight Tracking</h2>
        <div className="weight-input">
          <input
            type="number"
            value={weightEntry}
            onChange={(e) => setWeightEntry(e.target.value)}
            placeholder="Enter weight (kg)"
          />
          <button onClick={addWeight}>Add Weight</button>
        </div>
        <div className="weight-history">
          {progressData.weight.map((entry, index) => (
            <div key={index} className="weight-entry">
              <span>{entry.date}</span>
              <span>{entry.value} kg</span>
            </div>
          ))}
        </div>
      </section>

      <section className="goals-tracker">
        <h2>Fitness Goals</h2>
        <div className="goal-input">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Enter new goal"
          />
          <button onClick={addGoal}>Add Goal</button>
        </div>
        <div className="goals-list">
          {progressData.goals.map((goal, index) => (
            <div key={index} className="goal-item">
              <input
                type="checkbox"
                checked={goal.completed}
                onChange={() => toggleGoal(index)}
              />
              <span className={goal.completed ? 'completed' : ''}>
                {goal.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="progress-suggestions">
        <h2>Suggestions</h2>
        <div className="suggestions-list">
          {generateSuggestions().map((suggestion, index) => (
            <div key={index} className="suggestion-item">
              <i className="fas fa-lightbulb"></i>
              <p>{suggestion}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="stats-summary">
        <h2>Summary</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Goals</h3>
            <p>{progressData.goals.length}</p>
          </div>
          <div className="stat-card">
            <h3>Completed Goals</h3>
            <p>{progressData.goals.filter(goal => goal.completed).length}</p>
          </div>
          <div className="stat-card">
            <h3>Weight Entries</h3>
            <p>{progressData.weight.length}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Progress;
