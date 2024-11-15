import React, { useState } from "react";
import * as tf from "@tensorflow/tfjs";
import "../App.css";

// Import the static image from assets
import sampleImage from "../assets/images/sample3.jpg";

function DetectImage() {
  const [processedImage, setProcessedImage] = useState(null);


  const detect = async () => {
    try {
      // Load the model
      const net = await tf.loadGraphModel("https://detections.s3.us-south.cloud-object-storage.appdomain.cloud/model.json");

      // Create an HTML image element
      const img = new Image();
      img.src = sampleImage;
      img.onload = async () => {
        const imageWidth = img.width;
        const imageHeight = img.height;

        // Convert the image to a tensor and preprocess
        const tensor = tf.browser.fromPixels(img);
        const resized = tf.image.resizeBilinear(tensor, [640, 480]);
        const casted = resized.cast("int32");
        const expanded = casted.expandDims(0);

        // Run the detection
        const obj = await net.executeAsync(expanded);

        console.log(await obj[2].array())

  

        // Extract bounding boxes, classes, and scores
        const boxes = await obj[4].array();
        const classes = await obj[0].array();
        const scores = await obj[6].array();

        // Create an output image with bounding boxes (as an example)
        const canvas = document.createElement("canvas");
        canvas.width = imageWidth;
        canvas.height = imageHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, imageWidth, imageHeight);

        // Draw bounding boxes for detected objects
        boxes[0].forEach((box) => {
          const [yMin, xMin, yMax, xMax] = box;
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            xMin * imageWidth,
            yMin * imageHeight,
            (xMax - xMin) * imageWidth,
            (yMax - yMin) * imageHeight
          );
        });

        // Convert canvas to data URL and set as processed image
        const dataUrl = canvas.toDataURL("image/png");

        // Let user download the image
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "processed_image.png";
        link.click();

        setProcessedImage(dataUrl);

        // Dispose of tensors
        tf.dispose(tensor);
        tf.dispose(resized);
        tf.dispose(casted);
        tf.dispose(expanded);
        tf.dispose(obj);
      };
    } catch (error) {
      console.error("Model loading or detection error:", error);
    }
  };

  return (
    <div className="App">
      <header>Detecting Pathogens</header>

      <div>
        <img
          src={sampleImage}
          alt="Input"
          style={{
            display: "block",
            width: 640,
            height: 480,
            marginBottom: "20px",
          }}
        />
      </div>

      {processedImage && (
        <div>
          <p>Processed Image:</p>
          <img
            src={processedImage}
            alt="Processed Output"
            style={{ width: 640, height: 480 }}
          />
        </div>
      )}

      <div className="buttons">
        <button onClick={detect}>Start</button>
      </div>
    </div>
  );
}


export default DetectImage;



