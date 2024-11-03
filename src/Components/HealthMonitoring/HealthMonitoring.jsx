import React, { useState, useEffect } from 'react';
import './HealthMonitoring.css';

const HealthMonitoring = () => {
  const [sleepData, setSleepData] = useState({
    sleepTime: '',
    wakeTime: '',
    quality: 'good',
    date: new Date().toISOString().split('T')[0]
  });

  const [sleepHistory, setSleepHistory] = useState([]);
  const [showDuration, setShowDuration] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(null);

  const [goals, setGoals] = useState({
    sleepGoal: '',
    postureGoal: '',
    generalGoal: ''
  });

  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchSleepHistory();
  }, []);

  const fetchSleepHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sleep', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSleepHistory(data.sleep_records || []);
      }
    } catch (error) {
      console.error('Error fetching sleep history:', error);
    }
  };

  const calculateDuration = (sleepTime, wakeTime) => {
    const sleep = new Date(`2000/01/01 ${sleepTime}`);
    let wake = new Date(`2000/01/01 ${wakeTime}`);
    
    if (wake < sleep) {
      wake = new Date(`2000/01/02 ${wakeTime}`);
    }
    
    const diff = (wake - sleep) / (1000 * 60 * 60);
    return Math.round(diff * 10) / 10;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSleepSubmit = async (e) => {
    e.preventDefault();
    const duration = calculateDuration(sleepData.sleepTime, sleepData.wakeTime);
    setCurrentDuration(duration);
    setShowDuration(true);

    // Format data for backend
    const backendData = {
      date: sleepData.date,
      sleepTime: sleepData.sleepTime,  // This will be converted to bed_time in backend
      wakeTime: sleepData.wakeTime,    // This will be converted to wake_time in backend
      quality: sleepData.quality
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sleep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(backendData)
      });

      if (response.ok) {
        // Create new sleep record for local state
        const newRecord = {
          date: sleepData.date,
          bed_time: sleepData.sleepTime,
          wake_time: sleepData.wakeTime,
          duration: duration,
          quality: sleepData.quality
        };

        // Update local state
        setSleepHistory(prevHistory => [newRecord, ...prevHistory]);

        // Clear form
        setSleepData({
          sleepTime: '',
          wakeTime: '',
          quality: 'good',
          date: new Date().toISOString().split('T')[0]
        });

        // Fetch updated history from backend
        fetchSleepHistory();
      } else {
        const errorData = await response.json();
        console.error('Failed to save sleep data:', errorData);
      }
    } catch (error) {
      console.error('Error saving sleep data:', error);
    }
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
            <label>Sleep Time:</label>
            <input
              type="time"
              value={sleepData.sleepTime}
              onChange={(e) => setSleepData({...sleepData, sleepTime: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Wake Time:</label>
            <input
              type="time"
              value={sleepData.wakeTime}
              onChange={(e) => setSleepData({...sleepData, wakeTime: e.target.value})}
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

        {/* Show duration after logging sleep */}
        {showDuration && currentDuration && (
          <div className="sleep-duration-result">
            <h4>Sleep Duration</h4>
            <p>{currentDuration} hours</p>
            {currentDuration < 7 ? (
              <p className="duration-warning">You should aim for at least 7 hours of sleep.</p>
            ) : (
              <p className="duration-good">Great job! You got enough sleep.</p>
            )}
          </div>
        )}
      </section>

      {/* Sleep History */}
      {sleepHistory.length > 0 && (
        <section className="sleep-history">
          <h3>Sleep History</h3>
          <div className="history-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Sleep Time</th>
                  <th>Wake Time</th>
                  <th>Duration</th>
                  <th>Quality</th>
                </tr>
              </thead>
              <tbody>
                {sleepHistory.map((record, index) => (
                  <tr key={index}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.bed_time}</td>
                    <td>{record.wake_time}</td>
                    <td>{record.duration} hours</td>
                    <td>{record.quality}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Progress Visualization */}
      {sleepHistory.length > 0 && (
        <section className="progress-visualization">
          <h3>Sleep Progress</h3>
          <div className="progress-container">
            <div className="progress-graph">
              {sleepHistory.slice(0, 7).map((record, index) => (
                <div key={index} className="graph-bar-container">
                  <div 
                    className="graph-bar"
                    style={{
                      height: `${(record.duration / 12) * 100}%`,
                      backgroundColor: record.duration >= 7 ? '#4CAF50' : '#FF9800'
                    }}
                  >
                    <div className="graph-tooltip">
                      <p>Date: {new Date(record.date).toLocaleDateString()}</p>
                      <p>Sleep: {record.bed_time}</p>
                      <p>Wake: {record.wake_time}</p>
                      <p>Duration: {record.duration}h</p>
                    </div>
                  </div>
                  <div className="graph-date">{formatDate(record.date)}</div>
                </div>
              ))}
            </div>
            <div className="graph-legend">
              <div className="legend-item">
                <span className="legend-color" style={{backgroundColor: '#4CAF50'}}></span>
                <span>7+ hours (Recommended)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{backgroundColor: '#FF9800'}}></span>
                <span>Less than 7 hours</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Other sections remain unchanged */}
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
    </div>
  );
};

export default HealthMonitoring;
