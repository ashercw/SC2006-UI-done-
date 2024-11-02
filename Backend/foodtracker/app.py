from flask import Flask, request, jsonify
from usda import get_usda_nutrition
from flask_cors import CORS
import os 
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/nutrition', methods=['POST'])
def nutrition_info():
    data = request.json
    food_name = data.get("food_name")
    quantity = float(data.get("quantity", 100))  # Default to 100g if not provided
    
    if not food_name:
        return jsonify({"error": "Food name is required"}), 400

    nutrition_data = get_usda_nutrition(food_name)
    if nutrition_data:
        # Scale nutrition based on the quantity
        factor = quantity / 100
        scaled_nutrition = {
            "description": nutrition_data["description"],
            "calories": round(nutrition_data["calories"] * factor, 2),
            "protein": round(nutrition_data["protein"] * factor, 2),
            "fat": round(nutrition_data["fat"] * factor, 2),
            "carbohydrates": round(nutrition_data["carbohydrates"] * factor, 2)
        }
        return jsonify(scaled_nutrition), 200
    else:
        return jsonify({"error": "Nutritional information not found"}), 404

if __name__ == "__main__":
    app.run(debug=True, port=5001)
