# api_test.py

from usda import get_usda_nutrition

# Replace with your USDA API key
USDA_API_KEY = "whu22Y5p90dlqijPy6Jmi2sw8dHh0oK8rfO4RnaY"

# Test with a specific food item
food_name = "chicken rice"
nutrition_data = get_usda_nutrition(USDA_API_KEY, food_name)

if nutrition_data:
    print(f"Nutritional data for {food_name}:")
    print(nutrition_data)
else:
    print("No nutritional data found for", food_name)
