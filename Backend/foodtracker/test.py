import requests

# Base URL of the API
base_url = 'http://127.0.0.1:5001'

# Test adding a meal
response = requests.post(f'{base_url}/nutrition', json={
    "type": "lunch",
    "food_name": "apple",
    "quantity": 100,
    "date": "2024-11-02",
    "calories": 52,
    "protein": 0.3,
    "carbohydrates": 14,
    "fat": 0.2
})
print('Add meal response:', response.json())

# Test getting all meals
response = requests.get(f'{base_url}/meals')
print('Get all meals response:', response.json())

# Test getting meals by date
response = requests.get(f'{base_url}/meals?date=2024-11-02')
print('Get meals by date response:', response.json())

# Assume a meal ID of 1 for delete and update tests
meal_id = 1

# Test deleting a meal by ID
# response = requests.delete(f'{base_url}/meals/{meal_id}')
# print('Delete meal response:', response.json())

# Test updating a meal by ID
response = requests.put(f'{base_url}/meals/{meal_id}', json={
    "type": "dinner",
    "food_name": "chicken breast",
    "quantity": 150,
    "calories": 165,
    "protein": 31,
    "carbohydrates": 0,
    "fat": 3.6
})
print('Update meal response:', response.json())
