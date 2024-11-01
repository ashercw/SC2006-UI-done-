from Backend.App.models import Sleep
from datetime import datetime, timedelta  

class SleepPage:

    def start_interface(self):
        print("Welcome to the Sleep Tracker!")
        print("Choose an option:")
        print("1. Schedule Sleep / Add New Sleep Record")
        print("2. Edit Past Sleep Record")
        print("3. View Sleep Records")
        # self.display_weekly_sleep_graph()

    def add_sleep_data(self, user_ID, date, bed_time, wake_time):
        sleep_record = Sleep.add_sleep_record(user_ID, date, bed_time, wake_time)
        print(f"Added sleep record: {sleep_record}")

    def list_sleep_times(self):
        # Calculate the start date (7 days ago)
        start_date = datetime.now() - timedelta(days=7)

        # Query the database for sleep records from the past week
        sleep_records = Sleep.query.filter(Sleep.bedTime >= start_date).all()

        # Print the retrieved records
        if not sleep_records:
            print("No sleep records found for the past week.")
            return

        print("Sleep Records for the Past Week:")
        for record in sleep_records:
            print(f"User ID: {record.userID}, "
                  f"Bed Time: {record.bedTime}, "
                  f"Wake Time: {record.wakeTime}, "
                  f"Sleep Duration: {record.sleepDuration} hours")