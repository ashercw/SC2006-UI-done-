from . import create_app, db
from .models import User, Sleep
from datetime import datetime

app = create_app()

with app.app_context():
    # Drop all tables
    db.drop_all()
    
    # Create all tables
    db.create_all()
    
    # Create a test user
    test_user = User(
        first_name='Test',
        last_name='User',
        email='test@example.com',
        password='password123',
        date_of_birth=datetime.strptime('1990-01-01', '%Y-%m-%d').date()
    )
    
    # Add and commit the test user
    db.session.add(test_user)
    db.session.commit()
    
    print("Database tables created successfully!")
    print(f"Test user created with ID: {test_user.id}")
