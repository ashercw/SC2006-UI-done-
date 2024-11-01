from flask import Blueprint, request, jsonify
from .models import WorkoutList, db

api_bp = Blueprint('api', __name__)

@api_bp.route('/workouts', methods=['POST'])
def add_workout():
    data = request.get_json()
    new_workout = WorkoutList(
        workoutType=data['workoutType'],
        difficulty=data['difficulty'],
        duration=data['duration']
    )
    db.session.add(new_workout)
    db.session.commit()
    return jsonify({"message": "Workout added successfully"}), 201