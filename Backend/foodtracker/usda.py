import requests

def get_usda_nutrition(api_key, food_name):
    """Fetches nutrition data for a given food item from the USDA API."""
    base_url = "https://api.nal.usda.gov/fdc/v1/foods/search"
    params = {
        "api_key": "whu22Y5p90dlqijPy6Jmi2sw8dHh0oK8rfO4RnaY",
        "query": food_name,
        "pageSize": 1  # Return only the top result
    }
    
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        data = response.json()
        
        # Check if any food results were returned
        if "foods" in data and len(data["foods"]) > 0:
            food_data = data["foods"][0]  # Take the first result
            nutrients = {n['nutrientName']: n['value'] for n in food_data['foodNutrients']}
            return {
                "description": food_data.get("description", "Unknown"),
                "calories": nutrients.get("Energy", 0),
                "protein": nutrients.get("Protein", 0),
                "fat": nutrients.get("Total lipid (fat)", 0),
                "carbohydrates": nutrients.get("Carbohydrate, by difference", 0)
            }
    return None
