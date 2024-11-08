import requests 
import sys 
from main import tokenize_by_quantity, process_tokens_to_foods 
 
# Base URL of the Flask API 
base_url = 'http://127.0.0.1:5001' 
 
def main(): 
    if len(sys.argv) > 1: 
        input_text = sys.argv[1] 
    else: 
        input_text = input("Enter meal details: ") 
 
    # Use main.py functions to tokenize and process input 
    tokenized_foods = tokenize_by_quantity(input_text) 
    foods = process_tokens_to_foods(tokenized_foods) 
 
    payload = {"foods": foods} 
 
    # Send the request to the /nutrition endpoint 
    response = requests.post(f'{base_url}/nutrition', json=payload) 
 
    if response.status_code == 200: 
        nutrition_results = response.json() 
        print("\nNutritional information:") 
        for food in nutrition_results: 
            if "error" in food: 
                print(f"{food['food_name']}: {food['error']}") 
            else: 
                print(f"{food['food_name']}: {food['quantity']}g, " 
                      f"Calories: {food['calories']} kcal, " 
                      f"Protein: {food['protein']}g, " 
                      f"Fat: {food['fat']}g, " 
                      f"Carbohydrates: {food['carbohydrates']}g") 
    else: 
        print("Error:", response.json()) 
 
if __name__ == "__main__": 
    main()