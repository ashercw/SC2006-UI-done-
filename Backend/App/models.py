from . import db
from datetime import datetime, time, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

# User Model
class User(db.Model):
    __tablename__ = 'users'
    
    # User Fields
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)  # Store the hashed password
    date_of_birth = db.Column(db.Date, nullable=False)
    weight = db.Column(db.Integer, nullable=True)  # Optional field
    height = db.Column(db.Integer, nullable=True)  # Optional field
    goal = db.Column(db.String(200), nullable=True)  # Optional field
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    sleep_records = db.relationship('Sleep', backref='user', lazy=True)

    def __init__(self, first_name, last_name, email, password, date_of_birth, weight=None, height=None, goal=None):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.password_hash = generate_password_hash(password)
        self.date_of_birth = date_of_birth
        self.weight = weight
        self.height = height
        self.goal = goal

    def verifyPassword(self, password):
        return check_password_hash(self.password_hash, password)

    def updateProfile(self, first_name=None, last_name=None, email=None, weight=None, height=None, goal=None):
        if first_name:
            self.first_name = first_name
        if last_name:
            self.last_name = last_name
        if email:
            self.email = email
        if weight:
            self.weight = weight
        if height:
            self.height = height
        if goal:
            self.goal = goal
        db.session.commit()

    def __repr__(self):
        return f'<User {self.email}>'

# Sleep Model
class Sleep(db.Model):
    __tablename__ = 'sleep'

    # Sleep Fields
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Updated to reference 'users.id'
    date = db.Column(db.Date, nullable=False)
    bed_time = db.Column(db.Time, nullable=False)
    wake_time = db.Column(db.Time, nullable=False)
    sleep_duration = db.Column(db.Integer, nullable=False)

    def __init__(self, user_id, date, bed_time, wake_time):
        self.user_id = user_id
        self.date = date
        self.bed_time = bed_time
        self.wake_time = wake_time
        self.sleep_duration = self.get_sleep_duration()
    
    def get_sleep_duration(self):
        bed_time_datetime = datetime.combine(self.date, self.bed_time)
        wake_time_datetime = datetime.combine(self.date, self.wake_time)
        if self.wake_time < self.bed_time:  # Handle case where waking up is on the next day
            wake_time_datetime += timedelta(days=1)
        duration = (wake_time_datetime - bed_time_datetime).seconds // 3600
        return duration

# WorkoutList Model
class WorkoutList(db.Model):
    __tablename__ = 'workouts'

    # WorkoutList Fields
    id = db.Column(db.Integer, primary_key=True)
    workout_type = db.Column(db.String(50), nullable=False)
    difficulty = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    date = db.Column(db.Date, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Added user relationship

    def __init__(self, workout_type, difficulty, duration, user_id, date=None):
        self.workout_type = workout_type
        self.difficulty = difficulty
        self.duration = duration
        self.user_id = user_id
        if date:
            self.date = date
