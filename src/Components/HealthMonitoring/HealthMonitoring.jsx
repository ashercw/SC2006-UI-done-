import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './HealthMonitoring.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const fetchSleepHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/sleep', {
        headers: getAuthHeaders()
      });
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

  useEffect(() => {
    fetchSleepHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
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
        headers: getAuthHeaders(),
        body: JSON.stringify({
          date: sleepData.date,
          sleepTime: sleepData.sleepTime,
          wakeTime: sleepData.wakeTime,
          quality: sleepData.quality
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const result = await response.json();
      setSleepHistory(prevHistory => [result.sleep_record, ...prevHistory]);
      setSleepData({
        sleepTime: '',
        wakeTime: '',
        quality: 'good',
        date: new Date().toISOString().split('T')[0]
      });

      await fetchSleepHistory();
    } catch (error) {
      console.error('Error saving sleep data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSleepGraph = () => {
    if (!sleepHistory.length) return null;

    const currentRecord = sleepHistory[currentDayIndex];
    const [sleepHour, sleepMin] = currentRecord.bed_time.split(':').map(Number);
    const [wakeHour, wakeMin] = currentRecord.wake_time.split(':').map(Number);

    // Convert to decimal hours
    const sleepTime = sleepHour + (sleepMin / 60);
    const wakeTime = wakeHour + (wakeMin / 60);

    // Calculate duration and data points
    let duration;
    if (wakeTime > sleepTime) {
      duration = wakeTime - sleepTime;
    } else {
      duration = (24 - sleepTime) + wakeTime;
    }

    // Generate data points every 15 minutes
    const points = Math.ceil(duration * 4); // 4 points per hour
    const labels = [];
    const data = [];

    for (let i = 0; i <= points; i++) {
      const timeOffset = (i / 4); // Convert to hours
      let currentTime = sleepTime + timeOffset;
      if (currentTime >= 24) {
        currentTime -= 24;
      }

      // Format time for label
      const hour = Math.floor(currentTime);
      const minute = Math.floor((currentTime % 1) * 60);
      labels.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);

      // Calculate sleep stage based on time into sleep
      const cycleTime = (timeOffset * 60) % 90; // 90-minute sleep cycle
      let stage;
      if (cycleTime < 10) {
        stage = 1; // Light Sleep
      } else if (cycleTime < 30) {
        stage = 2; // Deep Sleep
      } else if (cycleTime < 60) {
        stage = 3; // Deeper Sleep
      } else {
        stage = 4; // REM Sleep
      }
      data.push(stage);
    }

    const chartData = {
      labels,
      datasets: [{
        label: 'Sleep Stages',
        data: data,
        borderColor: '#00e5ff',
        backgroundColor: 'rgba(0, 229, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 4,
          ticks: {
            callback: (value) => {
              const stages = ['', 'Light Sleep', 'Deep Sleep', 'Deeper Sleep', 'REM Sleep'];
              return stages[value];
            },
            color: '#fff'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#fff',
            maxRotation: 45,
            minRotation: 45,
            callback: (_, index) => {
              return index % 4 === 0 ? labels[index] : '';
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const stages = ['', 'Light Sleep', 'Deep Sleep', 'Deeper Sleep', 'REM Sleep'];
              return stages[context.raw];
            }
          }
        }
      }
    };

    return (        
        <div className="sleep-graph-container">
          <div className="sleep-graph-nav">
            <button 
              className="nav-button"
              onClick={() => setCurrentDayIndex(prev => Math.min(prev + 1, sleepHistory.length - 1))}
              disabled={currentDayIndex >= sleepHistory.length - 1}
            >
              ← Previous Day
            </button>
            <span className="current-date">
              {new Date(currentRecord.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <button 
              className="nav-button"
              onClick={() => setCurrentDayIndex(prev => Math.max(prev - 1, 0))}
              disabled={currentDayIndex <= 0}
            >
              Next Day →
            </button>
          </div>

          <div className="sleep-graph">
            <Line data={chartData} options={options} />
          </div>

          <div className="sleep-info">
            <div className="sleep-time">
              <span className="sleep-icon">😴</span>
              <span>Sleep: {currentRecord.bed_time}</span>
            </div>
            <div className="wake-time">
              <span className="sleep-icon">⏰</span>
              <span>Wake: {currentRecord.wake_time}</span>
            </div>
            <div className="sleep-quality">
              Quality: {currentRecord.quality}
            </div>
            <div className="duration">
              Duration: {currentRecord.duration} hours
            </div>
          </div>
        </div>
    );
  };

  return (
    <div className='health-monitoring-background'>

      <div className="app-header">    
      <img src= "/fitnessApp_logo.png" alt="Fitness App Logo" className="logo" />         
      </div>

    <div className="health-monitoring-container">
      <main className="main-content">
        <div className="health-monitoring">
          <h2 align = 'center'>Health Monitoring</h2>
          
          <section className="sleep-tracking">
            <h3>Sleep Tracking</h3>
            <form onSubmit={handleSleepSubmit}>
            <div className="side-by-side">
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
              </div>  

              <div className="side-by-side">
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

          <section className="progress-visualization">
            <h3>Sleep Progress</h3>
            {loading ? (
              <p>Loading sleep progress...</p>
            ) : sleepHistory.length > 0 ? (
              generateSleepGraph()
            ) : (
              <p className="no-data-message">
                No sleep data available yet. Your sleep progress will be shown here once you start tracking.
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
    </div>
  );
};

export default HealthMonitoring;
