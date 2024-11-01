import React, { useState, useEffect } from 'react';
import './MealTracker.css';

const MealTracker = () => {
    const [meals, setMeals] = useState([]);
    const [newMeal, setNewMeal] = useState({
        type: 'breakfast',
        name: '',
        calories: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [totalCalories, setTotalCalories] = useState(0);

    useEffect(() => {
        const total = meals.reduce((sum, meal) => sum + Number(meal.calories), 0);
        setTotalCalories(total);
    }, [meals]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMeal(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newMeal.name && newMeal.calories) {
            setMeals(prev => [...prev, { ...newMeal, id: Date.now() }]);
            setNewMeal({
                type: 'breakfast',
                name: '',
                calories: '',
                date: new Date().toISOString().split('T')[0]
            });
        }
    };

    const getMealsByDate = () => {
        const groupedMeals = {};
        meals.forEach(meal => {
            if (!groupedMeals[meal.date]) {
                groupedMeals[meal.date] = [];
            }
            groupedMeals[meal.date].push(meal);
        });
        return groupedMeals;
    };

    return (
        <div className="meal-tracker">
            <h2>Meal Tracker</h2>
            
            <div className="meal-form-container">
                <form onSubmit={handleSubmit} className="meal-form">
                    <div className="form-group">
                        <label>Meal Type:</label>
                        <select 
                            name="type" 
                            value={newMeal.type}
                            onChange={handleInputChange}
                        >
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                            <option value="snacks">Snacks</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Food Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={newMeal.name}
                            onChange={handleInputChange}
                            placeholder="Enter food name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Calories:</label>
                        <input
                            type="number"
                            name="calories"
                            value={newMeal.calories}
                            onChange={handleInputChange}
                            placeholder="Enter calories"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Date:</label>
                        <input
                            type="date"
                            name="date"
                            value={newMeal.date}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <button type="submit" className="add-meal-btn">Add Meal</button>
                </form>

                <div className="calorie-summary">
                    <h3>Total Calories Today: {totalCalories}</h3>
                </div>
            </div>

            <div className="meal-history">
                <h3>Meal History</h3>
                {Object.entries(getMealsByDate()).map(([date, dateMeals]) => (
                    <div key={date} className="date-group">
                        <h4>{new Date(date).toLocaleDateString()}</h4>
                        <div className="meals-list">
                            {dateMeals.map(meal => (
                                <div key={meal.id} className="meal-item">
                                    <span className="meal-type">{meal.type}</span>
                                    <span className="meal-name">{meal.name}</span>
                                    <span className="meal-calories">{meal.calories} calories</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MealTracker;
