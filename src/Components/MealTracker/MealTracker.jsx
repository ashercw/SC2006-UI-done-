import React, { useState, useEffect } from 'react';
import './MealTracker.css';

const API_URL = 'http://localhost:5001';

const MealTracker = () => {
    const [meals, setMeals] = useState([]);
    const [inputText, setInputText] = useState("");
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
            calories: sum.calories + (meal.calories || 0),
            protein: sum.protein + (meal.protein || 0),
            carbs: sum.carbs + (meal.carbohydrates || 0),
            fat: sum.fat + (meal.fat || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        setNutritionTotals(totals);
    }, [meals]);

    const fetchNutritionData = async (text) => {
        try {
            const response = await fetch(`${API_URL}/nutrition`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
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
        setInputText(e.target.value);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputText.trim()) {
            setLoading(true);
            setError(null);
            try {
                const nutritionDataArray = await fetchNutritionData(inputText);
                if (nutritionDataArray && Array.isArray(nutritionDataArray)) {
                    const mealsWithNutrition = nutritionDataArray.map((data) => ({
                        id: Date.now() + Math.random(),
                        ...data
                    }));
                    setMeals(prev => [...prev, ...mealsWithNutrition]);
                    setInputText("");
                }
            } catch (error) {
                console.error('Error adding meals:', error);
                setError('Failed to add meals. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="meal-tracker-background">
            <div className="app-header">    
                <img src="/fitnessApp_logo.png" alt="Fitness App Logo" className="logo" />         
            </div>
            <div className="meal-tracker">
                <h1 className="title">Meal Tracker</h1>

                <div className="meal-form-card">
                    <form onSubmit={handleSubmit} className="meal-form">
                        <input
                            type="text"
                            placeholder="Enter your meal..."
                            value={inputText}
                            onChange={handleInputChange}
                            className="meal-input"
                        />
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="submit-button"
                        >
                            Send
                        </button>
                    </form>
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                </div>

                <div className="nutrition-summary">
                    <h2>Daily Nutrition Totals</h2>
                    <div className="nutrition-total-container">
                        <div className="nutrition-total-box">
                            <p>Calories</p>
                            <h3>{Math.round(nutritionTotals.calories)} kcal</h3>
                        </div>
                        <div className="nutrition-total-box">
                            <p>Protein</p>
                            <h3>{Math.round(nutritionTotals.protein)} g</h3>
                        </div>
                        <div className="nutrition-total-box">
                            <p>Carbs</p>
                            <h3>{Math.round(nutritionTotals.carbs)} g</h3>
                        </div>
                        <div className="nutrition-total-box">
                            <p>Fat</p>
                            <h3>{Math.round(nutritionTotals.fat)} g</h3>
                        </div>
                    </div>
                </div>

                <hr />

                <h2>Meal History</h2>
                <div className="meal-history">
                    {meals.length > 0 ? (
                        meals.map((meal) => (
                            <div key={meal.id} className="meal-item-card">
                                <p className="meal-name">{meal.food_name}</p>
                                <p className="meal-info">
                                    {meal.calories} cal, {meal.protein}g protein, {meal.carbohydrates}g carbs, {meal.fat}g fat
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="no-meals-message">No meals added yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MealTracker;
