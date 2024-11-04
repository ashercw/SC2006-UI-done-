from flask import Flask, request, jsonify
import cv2
import mediapipe as mp
import numpy as np
import tempfile

app = Flask(__name__)
mp_pose = mp.solutions.pose

# Initialize counters and stage variables
curl_counter, squat_counter = 0, 0
curl_stage, squat_stage = None, None

def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    return 360 - angle if angle > 180 else angle

def process_video(file_path):
    global curl_counter, squat_counter, curl_stage, squat_stage
    curl_counter, squat_counter = 0, 0  # Reset counters for each video

    cap = cv2.VideoCapture(file_path)
    print("Processing video at:", file_path)

    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Convert the frame to RGB for Mediapipe
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(image)

            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark

                # Define key points for calculating angles
                shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                            landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                         landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                         landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]

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
                    print("Curl counter incremented:", curl_counter)

                # Squat counter logic
                if squat_angle > 160:
                    squat_stage = "up"
                if squat_angle < 90 and squat_stage == 'up':
                    squat_stage = "down"
                    squat_counter += 1
                    print("Squat counter incremented:", squat_counter)

    cap.release()
    print("Final counts - Curl:", curl_counter, "Squat:", squat_counter)
    return curl_counter, squat_counter

@app.route('/api/analyze_posture', methods=['POST'])
def analyze_posture():
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file provided"}), 400

    # Save the uploaded video to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_video:
        file.save(temp_video.name)
        print("Video saved to:", temp_video.name)
        curl_count, squat_count = process_video(temp_video.name)

    print("Returning counts to frontend")
    return jsonify({
        "curl_count": curl_count,
        "squat_count": squat_count
    })

if __name__ == '__main__':
    app.run(debug=True)
