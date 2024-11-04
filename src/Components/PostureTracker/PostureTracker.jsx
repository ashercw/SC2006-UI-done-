import React, { useState, useRef } from 'react';
import './PostureTracker.css';

const PostureTracker = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [postureData, setPostureData] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);

  const startRecording = async () => {
    setIsRecording(true);
    recordedChunks.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "video/webm" });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        sendVideoToBackend(blob);
      };

      mediaRecorderRef.current.start();
      console.log("Recording started");
    } catch (error) {
      console.error("Error accessing webcam:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      const stream = videoRef.current.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      console.log("Recording stopped and sent to backend for analysis");
    }
  };

  const sendVideoToBackend = async (videoBlob) => {
    console.log("Sending video to backend for analysis...");
    const formData = new FormData();
    formData.append("video", videoBlob, "recording.webm");

    try {
      const response = await fetch("http://localhost:5000/api/analyze_posture", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Received analysis data from backend:", data);
        setPostureData(data); // Update the UI with counts
      } else {
        console.error("Error analyzing posture: Response not ok", response.status);
      }
    } catch (error) {
      console.error("Error uploading video:", error);
    }
  };

  return (
    <div className="posture-correction-container">
      <h2 align="center">Posture Correction</h2>
      <div className="controls">
        <button onClick={startRecording} disabled={isRecording}>Start Recording</button>
        <button onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>
      </div>
      <video ref={videoRef} autoPlay muted className="webcam-preview"></video>
      {postureData && (
        <div className="posture-data">
          <p>Curl Count: {postureData.curl_count}</p>
          <p>Squat Count: {postureData.squat_count}</p>
        </div>
      )}
    </div>
  );
};

export default PostureTracker;

