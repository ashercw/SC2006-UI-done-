import os
import requests
from dotenv import load_dotenv

load_dotenv()

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
            nutrients = {n['nutrientName']: n['value'] for n in food_data['foodNutrients']}
            return {
                "description": food_data.get("description", "Unknown"),
                "calories": nutrients.get("Energy", 0),
                "protein": nutrients.get("Protein", 0),
                "fat": nutrients.get("Total lipid (fat)", 0),
                "carbohydrates": nutrients.get("Carbohydrate, by difference", 0)
            }
    return None
