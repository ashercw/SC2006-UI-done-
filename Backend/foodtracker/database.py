from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///meals.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


class Meal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)
    calories = db.Column(db.Float, nullable=True)
    protein = db.Column(db.Float, nullable=True)
    carbohydrates = db.Column(db.Float, nullable=True)
    fat = db.Column(db.Float, nullable=True)


# Create the tables immediately when the script runs
with app.app_context():
    db.create_all()


@app.route('/nutrition', methods=['POST'])
def add_meal():
    data = request.json
    try:
        new_meal = Meal(
            type=data['type'],
            name=data['food_name'],
            quantity=data['quantity'],
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            calories=data.get('calories', 0),
            protein=data.get('protein', 0),
            carbohydrates=data.get('carbohydrates', 0),
            fat=data.get('fat', 0)
        )
        db.session.add(new_meal)
        db.session.commit()
        return jsonify({"message": "Meal added successfully"}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@app.route('/meals', methods=['GET'])
def get_meals():
    date = request.args.get('date')
    if date:
        date_obj = datetime.strptime(date, '%Y-%m-%d').date()
        meals = Meal.query.filter_by(date=date_obj).all()
    else:
        meals = Meal.query.all()

    result = []
    for meal in meals:
        result.append({
            "id": meal.id,
            "type": meal.type,
            "name": meal.name,
            "quantity": meal.quantity,
            "date": meal.date.isoformat(),
            "calories": meal.calories,
            "protein": meal.protein,
            "carbohydrates": meal.carbohydrates,
            "fat": meal.fat
        })
    return jsonify(result)


@app.route('/meals/<int:id>', methods=['DELETE'])
def delete_meal(id):
    meal = Meal.query.get(id)
    if meal:
        db.session.delete(meal)
        db.session.commit()
        return jsonify({"message": "Meal deleted successfully"}), 200
    return jsonify({"error": "Meal not found"}), 404


@app.route('/meals/<int:id>', methods=['PUT'])
def update_meal(id):
    meal = Meal.query.get(id)
    if not meal:
        return jsonify({"error": "Meal not found"}), 404
    
    data = request.json
    meal.type = data.get('type', meal.type)
    meal.name = data.get('food_name', meal.name)
    meal.quantity = data.get('quantity', meal.quantity)
    meal.date = datetime.strptime(data.get('date'), '%Y-%m-%d').date() if 'date' in data else meal.date
    meal.calories = data.get('calories', meal.calories)
    meal.protein = data.get('protein', meal.protein)
    meal.carbohydrates = data.get('carbohydrates', meal.carbohydrates)
    meal.fat = data.get('fat', meal.fat)

    try:
        db.session.commit()
        return jsonify({"message": "Meal updated successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5001)
