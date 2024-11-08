import os 
import requests 
from dotenv import load_dotenv 
import csv  
 
 
load_dotenv(os.path.join(os.path.dirname(__file__), 'config.env')) 
 
print("API Key:", os.getenv("API_KEY")) 
def get_usda_nutrition(food_name): 
    """Fetches nutrition data for a given food item from the USDA API.""" 
    api_key = os.getenv("API_KEY")   
    base_url = "https://api.nal.usda.gov/fdc/v1/foods/search" 
     
    # Parameters for the API request 
    params = { 
        "api_key": api_key, 
        "query": food_name, 
        "pageSize": 1 
    } 
     
    response = requests.get(base_url, params=params) 
    if response.status_code == 200: 
        data = response.json() 
         
        if "foods" in data and len(data["foods"]) > 0: 
            food_data = data["foods"][0] 
            nutrients = {} 
             
            # Map nutrient numbers to their values 
            for nutrient in food_data['foodNutrients']: 
                nutrient_number = nutrient.get('nutrientNumber', '') 
                nutrients[nutrient_number] = nutrient.get('value', 0) 
             
            return { 
                "description": food_data.get("description", "Unknown"), 
                "calories": nutrients.get("208", 0),  # Energy (kcal) 
                "protein": nutrients.get("203", 0),   # Protein 
                "fat": nutrients.get("204", 0),       # Total lipid (fat) 
                "carbohydrates": nutrients.get("205", 0)  # Carbohydrates 
            } 
    return None 
 
 
if __name__ == "__main__": 
    # Test input 
    food_name = "apple"  # You can change this to test different food items 
     
    # Call the get_usda_nutrition function 
    nutrition_info = get_usda_nutrition(food_name) 
     
    # Print the output 
    if nutrition_info: 
        print("Nutrition information for", food_name) 
        print("Description:", nutrition_info["description"]) 
        print("Calories:", nutrition_info["calories"]) 
        print("Protein:", nutrition_info["protein"]) 
        print("Fat:", nutrition_info["fat"]) 
        print("Carbohydrates:", nutrition_info["carbohydrates"]) 
    else: 
        print("Nutritional information not found for", food_name)