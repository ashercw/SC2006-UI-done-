import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import './PostureTracker.css';

const PostureTracker = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [postureData, setPostureData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const videoRef = useRef(null);
  const detectorRef = useRef(null);
  const requestRef = useRef(null);
  const intervalRef = useRef(null);

  // Generate random posture data for demonstration
  const generateRandomPosture = () => {
    const shoulderLevel = Math.random() > 0.5 ? 'Good' : 'Needs Adjustment';
    const verticalAlignment = Math.random() > 0.5 ? 'Good' : 'Needs Adjustment';
    const overall = (shoulderLevel === 'Good' && verticalAlignment === 'Good') 
      ? 'Good Posture' 
      : 'Poor Posture';

    return {
      shoulderLevel,
      verticalAlignment,
      overall,
      confidence: Math.random() > 0.7 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low'
    };
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Comment out actual TensorFlow initialization for now
        /*
        await tf.ready();
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
          minPoseScore: 0.1
        };
        detectorRef.current = await poseDetection.createDetector(model, detectorConfig);
        */

        // Instead, just set as loaded immediately
        if (mounted) {
          setModelLoaded(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Initialization error:', err);
        if (mounted) {
          setError(`Initialization failed: ${err.message}`);
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTracking = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      
      setIsTracking(true);
      setIsLoading(false);

      // Instead of pose detection, use random values
      intervalRef.current = setInterval(() => {
        setPostureData(generateRandomPosture());
      }, 2000);

      /* Comment out actual pose detection for now
      const detectPose = async () => {
        if (!isTracking || !detectorRef.current || !videoRef.current) return;
        try {
          const poses = await detectorRef.current.estimatePoses(videoRef.current);
          if (poses.length > 0) {
            analyzePose(poses[0]);
          }
          requestRef.current = requestAnimationFrame(detectPose);
        } catch (err) {
          console.error('Pose detection error:', err);
        }
      };
      requestRef.current = requestAnimationFrame(detectPose);
      */

    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to access camera. Please check permissions.');
      setIsTracking(false);
      setIsLoading(false);
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setPostureData(null);
  };

  /* Comment out actual pose analysis for now
  const analyzePose = (pose) => {
    const keypoints = pose.keypoints;
    const shoulders = keypoints.filter(kp => 
      kp.name === 'left_shoulder' || kp.name === 'right_shoulder'
    );
    const hips = keypoints.filter(kp => 
      kp.name === 'left_hip' || kp.name === 'right_hip'
    );

    if (shoulders.length === 2 && hips.length === 2) {
      const shoulderSlope = Math.abs(
        (shoulders[1].y - shoulders[0].y) / (shoulders[1].x - shoulders[0].x)
      );

      const verticalSlope = Math.abs(
        ((hips[0].x + hips[1].x)/2 - (shoulders[0].x + shoulders[1].x)/2) / 
        ((hips[0].y + hips[1].y)/2 - (shoulders[0].y + shoulders[1].y)/2)
      );

      const isShoulderLevel = shoulderSlope < 0.2;
      const isVerticalAligned = verticalSlope < 0.2;

      setPostureData({
        shoulderLevel: isShoulderLevel ? 'Good' : 'Needs Adjustment',
        verticalAlignment: isVerticalAligned ? 'Good' : 'Needs Adjustment',
        overall: isShoulderLevel && isVerticalAligned ? 'Good Posture' : 'Poor Posture',
        confidence: 'high'
      });
    }
  };
  */

  return (
    <div className="posture-track-background">
      <div class="app-header">    
      <img src= "/fitnessApp_logo.png" alt="Fitness App Logo" className="logo" />         
      </div>

      <div className="posture-correction-container">
        <h2>Posture Correction</h2>
        <hr class="divider"></hr>
        <h2>Please ensure your upper body is visible :) </h2> 

        <div className="posture-logo">
          <img src= "/posture.jpeg" alt="Fitness App Logo" className="posture" /> 
      </div>

        {isLoading && (
          <div className="loading-message">
            Loading... Please wait
          </div>
        )}
        
        <div className="controls">
          <button 
            onClick={startTracking} 
            disabled={isTracking || isLoading || !modelLoaded}
            className={isTracking || isLoading || !modelLoaded ? 'disabled' : ''}
          >
            {isLoading ? 'Initializing...' : 'Start Tracking'}
          </button>
          <button 
            onClick={stopTracking} 
            disabled={!isTracking || isLoading}
            className={!isTracking || isLoading ? 'disabled' : ''}
          >
            Stop Tracking
          </button>
        </div>

        <div className="video-container">
          <video 
            ref={videoRef} 
            className="webcam-preview" 
            playsInline
            style={{ display: isTracking ? 'block' : 'none' }}
          />
          {isTracking && (
            <div className="tracking-overlay">
              {postureData ? postureData.overall : 'Starting tracking...'}
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {postureData && (
          <div className="posture-data">
            <div className={`confidence-indicator ${postureData.confidence}`}>
              Detection Confidence: {postureData.confidence.charAt(0).toUpperCase() + postureData.confidence.slice(1)}
            </div>
            <h3>Posture Analysis:</h3>
            <p>Shoulder Level: <span className={postureData.shoulderLevel === 'Good' ? 'good' : 'warning'}>
              {postureData.shoulderLevel}
            </span></p>
            <p>Vertical Alignment: <span className={postureData.verticalAlignment === 'Good' ? 'good' : 'warning'}>
              {postureData.verticalAlignment}
            </span></p>
            <p>Overall: <span className={postureData.overall === 'Good Posture' ? 'good' : 'warning'}>
              {postureData.overall}
            </span></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostureTracker;
