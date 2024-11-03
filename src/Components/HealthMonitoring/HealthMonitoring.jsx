import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setLoading(true);
      setError(null);
      const response = await fetch('/api/sleep');
      if (response.ok) {
        const data = await response.json();
        const sortedRecords = (data.sleep_records || []).sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        setSleepHistory(sortedRecords);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch sleep records:', errorData);
      }
    } catch (error) {
      console.error('Error fetching sleep history:', error);
    } finally {
      setLoading(false);
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
    setLoading(true);
    setError(null);

    try {
      const duration = calculateDuration(sleepData.sleepTime, sleepData.wakeTime);
      setCurrentDuration(duration);
      setShowDuration(true);

      const response = await fetch('/api/sleep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: sleepData.date,
          sleepTime: sleepData.sleepTime,
          wakeTime: sleepData.wakeTime,
          quality: sleepData.quality
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Add the new record to the sleep history
        setSleepHistory(prevHistory => [result.sleep_record, ...prevHistory]);

        // Clear the form
        setSleepData({
          sleepTime: '',
          wakeTime: '',
          quality: 'good',
          date: new Date().toISOString().split('T')[0]
        });

        // Refresh the sleep history
        await fetchSleepHistory();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save sleep record');
      }
    } catch (error) {
      console.error('Error saving sleep data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="health-monitoring-container">
      <main className="main-content">
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
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Log Sleep'}
              </button>
            </form>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

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
          <section className="sleep-history">
            <h3>Sleep History</h3>
            <div className="history-table">
              {loading ? (
                <p>Loading sleep records...</p>
              ) : sleepHistory.length > 0 ? (
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
              ) : (
                <p className="no-data-message">No sleep records available yet. Start tracking your sleep above!</p>
              )}
            </div>
          </section>

          {/* Progress Visualization */}
          <section className="progress-visualization">
            <h3>Sleep Progress</h3>
            <div className="progress-container">
              {loading ? (
                <p>Loading sleep progress...</p>
              ) : sleepHistory.length > 0 ? (
                <>
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
                </>
              ) : (
                <p className="no-data-message">No sleep data available yet. Your sleep progress will be shown here once you start tracking.</p>
              )}
            </div>
          </section>

          <section className="posture-upload">
            <h3>Posture Analysis</h3>
            <div className="upload-container">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setSelectedImage(reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
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
            <form onSubmit={(e) => {
              e.preventDefault();
              console.log('Goals submitted:', goals);
            }}>
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
      </main>
    </div>
  );
};

export default HealthMonitoring;
