from flask import Flask, request, jsonify
from usda import get_usda_nutrition
import spacy
from word2number import w2n
import os 
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
nlp = spacy.load("en_core_web_sm")  # Load spaCy model


USDA_API_KEY = os.getenv("API_KEY")  

def parse_food_items(text):
    """Extract food items and quantities from text."""
    doc = nlp(text)
    results = []
    current_quantity = None

    for token in doc:
        if token.like_num:  # Recognize numbers
            try:
                current_quantity = w2n.word_to_num(token.text)
            except ValueError:
                current_quantity = int(token.text)

        elif current_quantity is not None and token.pos_ == "NOUN":
            food_item = token.text
            results.append((food_item, current_quantity))
            current_quantity = None  # Reset after use

    return results

@app.route('/nutrition', methods=['POST'])
def nutrition_info():
    data = request.json
    text = data.get("text")
    food_items = parse_food_items(text)
    results = {}

    for food_item, quantity in food_items:
        nutrition_data = get_usda_nutrition(USDA_API_KEY, food_item)
        if nutrition_data:
            # Scale nutrition based on the quantity detected
            factor = quantity / 100
            scaled_nutrition = {k: round(v * factor, 2) for k, v in nutrition_data.items()}
            results[food_item] = {"quantity": quantity, "nutrition": scaled_nutrition}
        else:
            results[food_item] = {"error": "Nutritional information not found"}

    return jsonify(results), 200

if __name__ == "__main__":
    app.run(debug=True)

