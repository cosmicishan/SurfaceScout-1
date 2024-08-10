import React, { useState, useRef, useEffect } from 'react';
import './dashboard.css';

const Cropping = ({ source }) => {
    const [points, setPoints] = useState([]);
    const canvasRef = useRef(null);
    const imageRef = useRef(new Image());

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const image = imageRef.current;

        image.src = source;
        image.onload = () => {
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);
        };

        return () => {
            setPoints([]);
        };
    }, [source]);

    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setPoints([...points, { x, y }]);
    };

    useEffect(() => {
        if (points.length > 0) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const image = imageRef.current;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0);

            // Draw polygon lines
            if (points.length > 1) {
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                ctx.closePath();
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Draw points
            points.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.fill();
            });
        }
    }, [points]);

    const cropImage = () => {
        if (points.length < 3) {
            alert("Please select at least 3 points to form a polygon.");
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const image = imageRef.current;

        // Create a new canvas for the cropped image
        const cropCanvas = document.createElement('canvas');
        const cropCtx = cropCanvas.getContext('2d');

        // Set the same size as the original canvas
        cropCanvas.width = canvas.width;
        cropCanvas.height = canvas.height;

        // Draw the polygon path on the new canvas
        cropCtx.beginPath();
        cropCtx.moveTo(points[0].x, points[0].y);
        points.forEach(point => cropCtx.lineTo(point.x, point.y));
        cropCtx.closePath();
        cropCtx.clip();

        // Draw the image into the cropped canvas
        cropCtx.drawImage(image, 0, 0);

        // Create a new image element to show the cropped area
        const croppedImage = new Image();
        croppedImage.src = cropCanvas.toDataURL();

        setPoints([]);
    };

    return (
        <>
            <div className="cropping">
                <div className="image-container">
                    <canvas ref={canvasRef} onClick={handleCanvasClick} />
                </div>
            </div>
            <div className="child third">
                <button className='cropBTN' onClick={cropImage}>Predict Cropped.</button>
            </div>
        </>
    );
};

export default Cropping;
