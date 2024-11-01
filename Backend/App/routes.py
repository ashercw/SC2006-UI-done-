from flask import Blueprint, request, jsonify
from .models import WorkoutList, Sleep, db
from datetime import datetime, time
from controllers import schedule_workout, track_workout

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

# Route to retrieve a workout by ID
@api_bp.route('/workouts/<int:id>', methods=['GET'])
def track_workout(id):
    workout = WorkoutList.query.get(id)
    if workout:
        return jsonify({
            "workoutType": workout.workoutType,
            "difficulty": workout.difficulty,
            "duration": workout.duration
        }), 200
    else:
        return jsonify({"message": "Workout not found"}), 404
    

@api_bp.route('/sleep', methods=['POST'])
def add_sleep():
    try:
        data = request.get_json()
        date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        bed_time = datetime.strptime(data['bedTime'], '%H:%M').time()
        wake_time = datetime.strptime(data['wakeTime'], '%H:%M').time()
        
        new_sleep = Sleep.add_sleep_record(
            user_ID=data['userId'],
            date=date,
            bed_time=bed_time,
            wake_time=wake_time
        )
        
        return jsonify({
            "message": "Sleep record added successfully",
            "duration": new_sleep.get_sleep_duration()
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@api_bp.route('/sleep/<int:user_id>', methods=['GET'])
def get_sleep_records(user_id):
    try:
        # Get optional date range parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = Sleep.query.filter_by(user_ID=user_id)
        
        if start_date:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(Sleep.date >= start)
        if end_date:
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(Sleep.date <= end)
            
        sleep_records = query.order_by(Sleep.date.desc()).all()
        
        records = [{
            'id': record.id,
            'date': record.date.strftime('%Y-%m-%d'),
            'bedTime': record.bed_time.strftime('%H:%M'),
            'wakeTime': record.wake_time.strftime('%H:%M'),
            'duration': record.sleep_duration
        } for record in sleep_records]
        
        return jsonify(records), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
