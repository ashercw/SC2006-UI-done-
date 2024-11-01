from Backend.App import create_app, db
from Backend.App.models import WorkoutList, User, Sleep

app = create_app()

with app.app_context():
    db.create_all()  # Create tables in the database
    print("Database tables created successfully!")