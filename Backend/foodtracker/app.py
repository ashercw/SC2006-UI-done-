from flask import Flask, request, jsonify 
from usda import get_usda_nutrition 
from main import tokenize_by_quantity, process_tokens_to_foods 
from flask_cors import CORS 
import os 
from dotenv import load_dotenv 
 
# Load environment variables from .env 
load_dotenv() 
 
app = Flask(__name__) 
CORS(app) 
 
@app.route('/nutrition', methods=['POST']) 
def nutrition_info(): 
    data = request.json 
    input_text = data.get("text", "")  # Receive plain text input 
 
    if not input_text: 
        return jsonify({"error": "Text input is required"}), 400 
 
    # Step 1: Tokenize and process input text into structured food data 
    try: 
        tokenized_foods = tokenize_by_quantity(input_text) 
        foods = process_tokens_to_foods(tokenized_foods) 
    except Exception as e: 
        print("Error during tokenization:", e) 
        return jsonify({"error": "Failed to process food input"}), 500 
 
    # Step 2: Fetch nutrition data for each tokenized food item 
    nutrition_results = [] 
    for food in foods: 
        food_name = food.get('food_name') 
        quantity = float(food.get("quantity", 100))  # Default to 100g if quantity not provided 
 
        if not food_name: 
            continue  # Skip if no food name found 
 
        print(f"Processing {food_name} with quantity {quantity} grams") 
 
        # Fetch nutrition data 
        try: 
            nutrition_data = get_usda_nutrition(food_name) 
        except Exception as e: 
            print(f"Error fetching nutrition data for {food_name}:", e) 
            nutrition_results.append({"food_name": food_name, "error": "Nutritional information fetch failed"}) 
            continue 
 
        # If nutrition data is found, scale it to the specified quantity 
        if nutrition_data: 
            factor = quantity / 100.0  # Calculate scaling factor based on specified quantity 
            scaled_nutrition = { 
                "food_name": food_name, 
                "quantity": quantity, 
                "calories": round(nutrition_data.get("calories", 0) * factor, 2), 
                "protein": round(nutrition_data.get("protein", 0) * factor, 2), 
                "fat": round(nutrition_data.get("fat", 0) * factor, 2), 
                "carbohydrates": round(nutrition_data.get("carbohydrates", 0) * factor, 2) 
            } 
            nutrition_results.append(scaled_nutrition) 
        else: 
            nutrition_results.append({"food_name": food_name, "error": "Nutritional information not found"}) 
 
    return jsonify(nutrition_results), 200 
 
if __name__ == "__main__": 
    app.run(debug=True, port=5001)