import React, { useState, useEffect } from 'react';
import './MealTracker.css';

const API_URL = 'http://localhost:5001'; // Updated Flask server URL

const MealTracker = () => {
    const [meals, setMeals] = useState([]);
    const [newMeal, setNewMeal] = useState({
        type: 'breakfast',
        name: '',
        quantity: '100',
        date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [nutritionTotals, setNutritionTotals] = useState({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    });

    useEffect(() => {
        const totals = meals.reduce((sum, meal) => ({
            calories: sum.calories + (meal.nutrition?.calories || 0),
            protein: sum.protein + (meal.nutrition?.protein || 0),
            carbs: sum.carbs + (meal.nutrition?.carbohydrates || 0),
            fat: sum.fat + (meal.nutrition?.fat || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
        
        setNutritionTotals(totals);
    }, [meals]);

    const fetchNutritionData = async (foodName, quantity) => {
        try {
            const response = await fetch(`${API_URL}/nutrition`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    food_name: foodName,
                    quantity: parseFloat(quantity)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch nutrition data');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching nutrition data:', error);
            setError(error.message);
            return null;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMeal(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null); // Clear any previous errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newMeal.name && newMeal.quantity) {
            setLoading(true);
            setError(null);
            try {
                const nutritionData = await fetchNutritionData(newMeal.name, newMeal.quantity);
                if (nutritionData) {
                    const mealWithNutrition = {
                        ...newMeal,
                        id: Date.now(),
                        nutrition: nutritionData
                    };
                    setMeals(prev => [...prev, mealWithNutrition]);
                    setNewMeal({
                        type: 'breakfast',
                        name: '',
                        quantity: '100',
                        date: new Date().toISOString().split('T')[0]
                    });
                }
            } catch (error) {
                console.error('Error adding meal:', error);
                setError('Failed to add meal. Please try again.');
            } finally {
                setLoading(false);
            }
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
        <div className= "meal-tracker">
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
                            placeholder="Enter food name (e.g., apple, chicken breast)"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Quantity (grams):</label>
                        <input
                            type="number"
                            name="quantity"
                            value={newMeal.quantity}
                            onChange={handleInputChange}
                            placeholder="Enter quantity in grams"
                            min="1"
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

                    <button type="submit" className="add-meal-btn" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Meal'}
                    </button>
                </form>

                {error && <div className="error-message">{error}</div>}

                <div className="nutrition-summary">
                    <h3>Daily Nutrition Totals</h3>
                    <div className="nutrition-totals">
                        <div>Calories: {Math.round(nutritionTotals.calories)}</div>
                        <div>Protein: {Math.round(nutritionTotals.protein)}g</div>
                        <div>Carbs: {Math.round(nutritionTotals.carbs)}g</div>
                        <div>Fat: {Math.round(nutritionTotals.fat)}g</div>
                    </div>
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
                                    <span className="meal-name">
                                        {meal.quantity}g {meal.name}
                                    </span>
                                    <div className="meal-nutrition">
                                        {meal.nutrition ? (
                                            <>
                                                <span>{Math.round(meal.nutrition.calories)} cal</span>
                                                <span>{Math.round(meal.nutrition.protein)}g protein</span>
                                                <span>{Math.round(meal.nutrition.carbohydrates)}g carbs</span>
                                                <span>{Math.round(meal.nutrition.fat)}g fat</span>
                                            </>
                                        ) : (
                                            <span>Nutrition data unavailable</span>
                                        )}
                                    </div>
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
