import cv2
import mediapipe as mp
import numpy as np

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

# Function to calculate angle between three points
def calculate_angle(a, b, c):
    a = np.array(a)  # First point
    b = np.array(b)  # Mid point
    c = np.array(c)  # End point
    
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    
    if angle > 180.0:
        angle = 360 - angle
        
    return angle 

# Initialize counters and stages
curl_counter, squat_counter = 0, 0
curl_stage, squat_stage = None, None

# Ask the user for input source
source = input("Enter 'webcam' to open webcam, or provide a file path for a video: ")

# Setup video capture based on user input
if source.lower() == 'webcam':
    cap = cv2.VideoCapture(0)
else:
    cap = cv2.VideoCapture(source)

with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
    while cap.isOpened():
        ret, frame = cap.read()
        
        # Break the loop if no frame is captured (end of video or webcam disconnected)
        if not ret:
            print("No frame captured. Exiting...")
            break

        # Recolor image to RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
      
        # Make detection
        results = pose.process(image)
    
        # Recolor back to BGR
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        
        # Extract landmarks
        try:
            landmarks = results.pose_landmarks.landmark
            
            # Arm curl coordinates
            shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                        landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
            elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
            wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
            
            # Squat coordinates
            hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                   landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
            knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
            ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
            
            # Calculate angles
            curl_angle = calculate_angle(shoulder, elbow, wrist)
            squat_angle = calculate_angle(hip, knee, ankle)
            
            # Curl counter logic
            if curl_angle > 160:
                curl_stage = "down"
            if curl_angle < 30 and curl_stage == 'down':
                curl_stage = "up"
                curl_counter += 1
                print(f"Curl Counter: {curl_counter}")  # Print for debugging
            
            # Squat counter logic
            if squat_angle > 160:
                squat_stage = "up"
            if squat_angle < 90 and squat_stage == 'up':
                squat_stage = "down"
                squat_counter += 1
                print(f"Squat Counter: {squat_counter}")  # Print for debugging

            # Display angle for debugging
            cv2.putText(image, f'Curl Angle: {int(curl_angle)}', 
                        (50, 50), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
            
            cv2.putText(image, f'Squat Angle: {int(squat_angle)}', 
                        (50, 100), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)

        except:
            pass
        
        # Display counters
        cv2.putText(image, f'CURL REPS: {curl_counter}', (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
        
        cv2.putText(image, f'SQUAT REPS: {squat_counter}', (10, 80),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
        
        # Render pose landmarks
        mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                  mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2), 
                                  mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2))               
        
        cv2.imshow('Exercise Tracker', image)

        # Press 'q' to quit
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
