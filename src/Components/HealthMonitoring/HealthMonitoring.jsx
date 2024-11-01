import React, { useState } from 'react';
import './HealthMonitoring.css';

const HealthMonitoring = () => {
  const [sleepData, setSleepData] = useState({
    hours: '',
    quality: 'good',
    date: new Date().toISOString().split('T')[0]
  });

  const [goals, setGoals] = useState({
    sleepGoal: '',
    postureGoal: '',
    generalGoal: ''
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [progress, setProgress] = useState([
    { date: '2023-01-01', sleepHours: 7 },
    { date: '2023-01-02', sleepHours: 8 },
    { date: '2023-01-03', sleepHours: 6 },
    { date: '2023-01-04', sleepHours: 7.5 },
    { date: '2023-01-05', sleepHours: 8 }
  ]);

  const handleSleepSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send this data to a backend
    setProgress([...progress, { 
      date: sleepData.date, 
      sleepHours: parseFloat(sleepData.hours) 
    }]);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send goals to a backend
    console.log('Goals submitted:', goals);
  };

  return (
    <div className="health-monitoring">
      <h2>Health Monitoring</h2>
      
      {/* Sleep Tracking Form */}
      <section className="sleep-tracking">
        <h3>Sleep Tracking</h3>
        <form onSubmit={handleSleepSubmit}>
          <div className="form-group">
            <label>Hours of Sleep:</label>
            <input
              type="number"
              step="0.5"
              value={sleepData.hours}
              onChange={(e) => setSleepData({...sleepData, hours: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Sleep Quality:</label>
            <select
              value={sleepData.quality}
              onChange={(e) => setSleepData({...sleepData, quality: e.target.value})}
            >
              <option value="poor">Poor</option>
              <option value="fair">Fair</option>
              <option value="good">Good</option>
              <option value="excellent">Excellent</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              value={sleepData.date}
              onChange={(e) => setSleepData({...sleepData, date: e.target.value})}
            />
          </div>
          <button type="submit">Log Sleep</button>
        </form>
      </section>

      {/* Posture Photo Upload */}
      <section className="posture-upload">
        <h3>Posture Analysis</h3>
        <div className="upload-container">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            id="posture-upload"
          />
          <label htmlFor="posture-upload" className="upload-button">
            Choose Photo
          </label>
          {selectedImage && (
            <div className="image-preview">
              <img src={selectedImage} alt="Posture preview" />
            </div>
          )}
        </div>
      </section>

      {/* Goal Setting */}
      <section className="goal-setting">
        <h3>Set Health Goals</h3>
        <form onSubmit={handleGoalSubmit}>
          <div className="form-group">
            <label>Daily Sleep Goal (hours):</label>
            <input
              type="number"
              value={goals.sleepGoal}
              onChange={(e) => setGoals({...goals, sleepGoal: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Posture Goal:</label>
            <textarea
              value={goals.postureGoal}
              onChange={(e) => setGoals({...goals, postureGoal: e.target.value})}
              placeholder="e.g., Maintain straight back during work hours"
            />
          </div>
          <div className="form-group">
            <label>General Health Goal:</label>
            <textarea
              value={goals.generalGoal}
              onChange={(e) => setGoals({...goals, generalGoal: e.target.value})}
              placeholder="e.g., Improve overall sleep quality"
            />
          </div>
          <button type="submit">Set Goals</button>
        </form>
      </section>

      {/* Progress Visualization */}
      <section className="progress-visualization">
        <h3>Sleep Progress</h3>
        <div className="progress-graph">
          {progress.map((day, index) => (
            <div 
              key={index}
              className="graph-bar"
              style={{
                height: `${(day.sleepHours / 12) * 100}%`,
                backgroundColor: day.sleepHours >= 7 ? '#4CAF50' : '#FF9800'
              }}
              title={`${day.date}: ${day.sleepHours} hours`}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HealthMonitoring;
