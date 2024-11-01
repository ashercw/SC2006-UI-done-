from models import WorkoutList
from App import db
from flask import jsonify, request
from datetime import datetime

def schedule_workout():
    data = request.get_json()
    workout = WorkoutList(
        workoutType=data['workoutType'],
        difficulty=data['difficulty'],
        duration=data['duration'],
        date=datetime.strptime(data['date'], '%Y-%m-%d')
    )
    db.session.add(workout)
    db.session.commit()
    return jsonify({'message': 'Workout scheduled successfully'}), 201

def track_workout():
    workout_id = request.args.get('workout_id')
    workout = WorkoutList.query.get(workout_id)
    if workout:
        return jsonify({
            'workoutType': workout.workoutType,
            'difficulty': workout.difficulty,
            'duration': workout.duration,
            'date': workout.date.strftime('%Y-%m-%d')
        }), 200
    return jsonify({'message': 'Workout not found'}), 404