from App import create_app, db
from App.models import User
from datetime import datetime

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        # Drop all tables
        db.drop_all()
        print("Dropped all tables")
        
        # Create all tables
        db.create_all()
        print("Created all tables")
        
        # Create test user
        test_user = User(
            first_name='Test',
            last_name='User',
            email='test@example.com',
            password='password123',
            date_of_birth=datetime.strptime('1990-01-01', '%Y-%m-%d').date()
        )
        
        # Add and commit test user
        db.session.add(test_user)
        db.session.commit()
        print(f"Created test user with ID: {test_user.id}")
