import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './SleepTracker.css';

const SleepTracker = () => {
  const [sleepData, setSleepData] = useState([]);
  const [bedTime, setBedTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [loading, setLoading] = useState(false);
  const userId = 1; // TODO: Get this from authentication context

  useEffect(() => {
    fetchSleepData();
  }, []);

  const fetchSleepData = async () => {
    try {
      const response = await fetch(`/api/sleep/${userId}`);
      const data = await response.json();
      setSleepData(data);
    } catch (error) {
      console.error('Error fetching sleep data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/sleep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          date: new Date().toISOString().split('T')[0],
          bedTime,
          wakeTime,
        }),
      });

      if (response.ok) {
        // Clear form and refresh data
        setBedTime('');
        setWakeTime('');
        fetchSleepData();
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error adding sleep record:', error);
      alert('Failed to add sleep record');
    } finally {
      setLoading(false);
    }
  };

  const chartData = sleepData
    .slice()
    .reverse()
    .map(record => ({
      date: record.date,
      duration: record.duration
    }));

  return (
    <div className="sleep-tracker">
      <h2>Sleep Tracker</h2>
      
      <form onSubmit={handleSubmit} className="sleep-form">
        <div className="form-group">
          <label htmlFor="bedTime">Bed Time:</label>
          <input
            type="time"
            id="bedTime"
            value={bedTime}
            onChange={(e) => setBedTime(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="wakeTime">Wake Time:</label>
          <input
            type="time"
            id="wakeTime"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Sleep Record'}
        </button>
      </form>

      <div className="chart-container">
        {sleepData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                domain={[0, 'dataMax + 1']}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="duration"
                name="Sleep Duration"
                stroke="#4CAF50"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No sleep data available</p>
        )}
      </div>

      <div className="sleep-history">
        <h3>Recent Sleep Records</h3>
        <div className="records-list">
          {sleepData.slice(0, 5).map((record) => (
            <div key={record.id} className="record-item">
              <span className="date">{record.date}</span>
              <span className="time">{record.bedTime} - {record.wakeTime}</span>
              <span className="duration">{record.duration} hours</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SleepTracker;
