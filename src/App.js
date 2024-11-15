// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import "./App.css";
import { nextFrame } from "@tensorflow/tfjs";
// 2. TODO - Import drawing utility here
import {drawRect} from "./utilities"; 
useEffect(() => {
  runCoco();
}, [runCoco]); // Add runCoco to the dependency array

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // Main function
  const runCoco = async () => {
    // 3. TODO - Load network 
    const net = await tf.loadGraphModel('https://detections.s3.us-south.cloud-object-storage.appdomain.cloud/model.json')
    
    // Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 16.7);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // 4. TODO - Make Detections
      const img = tf.browser.fromPixels(video)
      const resized = tf.image.resizeBilinear(img, [640,480])
      const casted = resized.cast('int32')
      const expanded = casted.expandDims(0)
      const obj = await net.executeAsync(expanded)
      
      const boxes = await obj[4].array()
      const classes = await obj[5].array()
      const scores = await obj[6].array()
    
      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");

      // 5. TODO - Update drawing utility
      // drawSomething(obj, ctx)  
      requestAnimationFrame(()=>{drawRect(boxes[0], classes[0], scores[0], 0.9, videoWidth, videoHeight, ctx)}); 

      tf.dispose(img)
      tf.dispose(resized)
      tf.dispose(casted)
      tf.dispose(expanded)
      tf.dispose(obj)

    }
  };

  useEffect(()=>{runCoco()},[]);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          muted={true} 
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 8,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

/*function App() {
  const videoRef = useRef(null); // Ref for the IP camera video element
  const canvasRef = useRef(null);

  const ipCamUrl = "http://192.168.137.52:8080/video"; // Replace with your IP webcam URL

  const runCoco = async () => {
    const net = await tf.loadGraphModel('https://detections.s3.us-south.cloud-object-storage.appdomain.cloud/model.json');
    
    setInterval(() => {
      detect(net);
    }, 16.7);
  };

  const detect = async (net) => {
    if (
      typeof videoRef.current !== "undefined" &&
      videoRef.current !== null &&
      videoRef.current.readyState === 4
    ) {
      const video = videoRef.current;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      video.width = videoWidth;
      video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const img = tf.browser.fromPixels(video);
      const resized = tf.image.resizeBilinear(img, [640, 480]);
      const casted = resized.cast('int32');
      const expanded = casted.expandDims(0);
      const obj = await net.executeAsync(expanded);
      
      const boxes = await obj[4].array();
      const classes = await obj[5].array();
      const scores = await obj[6].array();

      const ctx = canvasRef.current.getContext("2d");

      requestAnimationFrame(() => {
        drawRect(boxes[0], classes[0], scores[0], 0.9, videoWidth, videoHeight, ctx);
      });

      tf.dispose(img);
      tf.dispose(resized);
      tf.dispose(casted);
      tf.dispose(expanded);
      tf.dispose(obj);
    }
  };

  useEffect(() => {
    runCoco();

    if (videoRef.current) {
      // Load the IP webcam video stream
      videoRef.current.src = ipCamUrl;
      videoRef.current.crossOrigin = "anonymous"; // Allow cross-origin access if needed
      videoRef.current.play(); // Start video playback
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 8,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}
*/

// Import dependencies
/*import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import "./App.css";
import { drawRect } from "./utilities";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  // Start and stop the detection
  const startDetection = () => setIsRunning(true);
  const stopDetection = () => setIsRunning(false);

  // Main function for running the model
  useEffect(() => {
    const runCoco = async () => {
      if (!isRunning) return;

      try {
        // Load model
        const net = await tf.loadGraphModel('https://detections.s3.us-south.cloud-object-storage.appdomain.cloud/model.json');

        const detect = async () => {
          if (
            webcamRef.current &&
            webcamRef.current.video.readyState === 4
          ) {
            const video = webcamRef.current.video;
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;

            webcamRef.current.video.width = videoWidth;
            webcamRef.current.video.height = videoHeight;
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;

            const img = tf.browser.fromPixels(video);
            const resized = tf.image.resizeBilinear(img, [640, 480]);
            const casted = resized.cast('int32');
            const expanded = casted.expandDims(0);
            const obj = await net.executeAsync(expanded);

            const boxes = await obj[4].array();
            const classes = await obj[5].array();
            const scores = await obj[6].array();

            const ctx = canvasRef.current.getContext("2d");
            requestAnimationFrame(() => {
              drawRect(boxes[0], classes[0], scores[0], 0.9, videoWidth, videoHeight, ctx);
            });

            tf.dispose(img);
            tf.dispose(resized);
            tf.dispose(casted);
            tf.dispose(expanded);
            tf.dispose(obj);
          }
        };

        const intervalId = setInterval(detect, 16.7);
        return () => clearInterval(intervalId);

      } catch (error) {
        console.error("Model loading or detection error:", error);
      }
    };

    if (isRunning) runCoco();
  }, [isRunning]);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          muted={true}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
            display: isRunning ? "block" : "none"
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 8,
            width: 640,
            height: 480,
            display: isRunning ? "block" : "none"
          }}
        />

        <div className="buttons">
          <button onClick={startDetection} disabled={isRunning}>Start</button>
          <button onClick={stopDetection} disabled={!isRunning}>Cancel Operation</button>
        </div>
      </header>
    </div>
  );
}
*/

export default App;
