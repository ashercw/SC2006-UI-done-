from . import db
from datetime import datetime, time, timedelta
from werkzeug.security import generate_password_hash, check_password_hash



# WorkoutList Model
class WorkoutList(db.Model):
    __tablename__ = 'workouts'

    # WorkoutList Fields
    id = db.Column(db.Integer, primary_key=True)
    workout_type = db.Column(db.String(50), nullable=False)
    difficulty = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    date = db.Column(db.Date, default=datetime.utcnow)

    def __repr__(self):
        return f'<Workout {self.workoutType}>'



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

    # Constructor
    def __init__(self, first_name, last_name, email, password, date_of_birth, weight=None, height=None, goal=None):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.password_hash = generate_password_hash(password)  # Hash password for security
        self.date_of_birth = date_of_birth
        self.weight = weight
        self.height = height
        self.goal = goal

    @classmethod
    def registerUser(cls, first_name, last_name, email, password, date_of_birth, weight=None, height=None, goal=None):
        if cls.query.filter_by(email=email).first():
            raise ValueError("User already exists with this email.")
        new_user = cls(first_name=first_name, last_name=last_name, email=email, date_of_birth=date_of_birth, weight=weight, height=height, goal=goal)
        new_user.set_password(password)  # Hash the password before saving
        db.session.add(new_user)
        db.session.commit()
        return new_user

    @classmethod
    def authenticate(cls, email, password):
        user = cls.query.filter_by(email=email).first()
        if user and user.verify_password(password):
            return user
        return None

    def verifyPassword(self, password):
        return check_password_hash(self.password_hash, password)

    def login(self, password):
        if self.verifyPassword(password):  # Verify password against the instance
            return self  # Return the user object if login is successful
        return None  # Return None if login fails

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
    user_ID = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    bed_time = db.Column(db.Time, nullable=False)
    wake_time = db.Column(db.Time, nullable=False)
    sleep_duration = db.Column(db.Integer, nullable=False)

    # Constructor
    def __init__(self, user_ID, date, bed_time, wake_time):
        self.user_ID = user_ID
        self.date = date
        self.bed_time = bed_time
        self.wake_time = wake_time
        self.sleep_duration = self.get_sleep_duration()
    
    @classmethod
    def add_sleep_record(cls, user_ID, date, bed_time, wake_time):
        # Create a new sleep record
        new_sleep = cls(user_ID=user_ID, date=date, bed_time=bed_time, wake_time=wake_time)
        db.session.add(new_sleep)
        db.session.commit()
        return new_sleep

    def get_date(self):
        return self.date

    def get_bed_time(self):
        return self.bed_time

    def get_wake_time(self):
        return self.wake_time

    def get_sleep_duration(self):
        # Calculate sleep duration in hours
        bed_time_datetime = datetime.combine(self.date, self.bed_time)
        wake_time_datetime = datetime.combine(self.date, self.wake_time)
        if self.wake_time < self.bed_time:  # Handle case where waking up is on the next day
            wake_time_datetime += timedelta(days=1)
        duration = (wake_time_datetime - bed_time_datetime).seconds // 3600
        return duration
    
    # def update_db(self):
    #     current_record = Sleep.query.get(self.id)
    #     updated = False

    #     if self.date != current_record.date:
    #         current_record.date = self.date
    #         updated = True

    #     if self.bed_time != current_record.bed_time:
    #         current_record.bed_time = self.bed_time
    #         updated = True

    #     if self.wake_time != current_record.wake_time:
    #         current_record.wake_time = self.wake_time
    #         updated = True

    #     new_sleep_duration = self.get_sleep_duration()
    #     if self.sleep_duration != new_sleep_duration:
    #         current_record.sleep_duration = new_sleep_duration
    #         updated = True

    #     if updated: # Commit to the database only if there were updates
    #         db.session.commit()
    
    def set_date(self, date):
        self.date = date
    
    def set_bed_time(self, bed_time):
        self.bed_time = bed_time
        self.sleep_duration = self.get_sleep_duration()
        db.session.commit()

    def set_wake_time(self, wake_time):
        self.wake_time = wake_time
        self.sleep_duration = self.get_sleep_duration()
        db.session.commit()
