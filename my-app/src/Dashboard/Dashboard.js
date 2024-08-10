import React, { useState, useRef, useEffect } from 'react';
import './dashboard.css';
import axios from 'axios';
import { Button } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';



const Dashboard = () => {
  const [imageSrc, setImageSrc] = useState('');
  const [images, setImages] = useState(['https://i.ibb.co/gjG368W/Whats-App-Image-2024-08-10-at-12-20-35-590bc4f7.jpg']);
  const [ispredicting, setIspredicting] = useState(false);
  const [isDonePredicting, setIsDonePredicting] = useState(false);
  const [prediction, setPrediction] = useState("---");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setImageSrc(imageUrl);
        setImages([...images, imageUrl]);
      };
      reader.readAsDataURL(file);
    }
  }

  const updateImage = (index) => {
    setPrediction("---");
    setImageSrc(images[index]);
  }

  // cropping
  const [points, setPoints] = useState([]);
  const canvasRef = useRef(null);
  const imageRef = useRef(new Image());

  useEffect(() => {
    if (!imageSrc) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = imageRef.current;

    image.src = imageSrc;
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
    };

    return () => {
      setPoints([]);
    };
  }, [imageSrc]);

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
      // taking that which model are selected
    const model = document.getElementById('model').value;

    console.log(model);

    
    if (model === 'rockDetect') {
      const cropCanvas = document.createElement('canvas');
      const ctx = cropCanvas.getContext('2d');
      const image = imageRef.current;
      cropCanvas.width = image.width;
      cropCanvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      axios.post('https://d00c-2409-40c1-1008-97aa-8e5f-fbae-8044-f3b8.ngrok-free.app/rockPredict', { image: cropCanvas.toDataURL() })
        .then(res => {
          setPrediction("---");
          let link = `data:image/png;base64,${res.data.image}`;
          setImageSrc(link);
        })
        .catch(err => {
          console.log(err);
          setPrediction('Something went wrong.');
        })
        .finally(() => {
          setIspredicting(false);
        });
      setIspredicting(false);
      return;
    }



    console.log(model);


    setIspredicting(true);
    if (points.length < 3) {

      // getting an image that are already cropped
      const cropCanvas = document.createElement('canvas');
      const ctx = cropCanvas.getContext('2d');
      const image = imageRef.current;
      cropCanvas.width = image.width;
      cropCanvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      // Sending image to the server using axios


      axios.post('https://d00c-2409-40c1-1008-97aa-8e5f-fbae-8044-f3b8.ngrok-free.app/predict', { image: cropCanvas.toDataURL() })
      .then(res => {
        console.log(res.data);
        setPrediction(res.data.modelOutput);
      })
      .catch(err => {
        console.log(err);
        setPrediction('Something went wrong.');
      })
      .finally(() => {
        setIspredicting(false);
      });
      setIspredicting(false);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = imageRef.current;

    // Calculate the bounding box of the polygon
    const minX = Math.min(...points.map(point => point.x));
    const minY = Math.min(...points.map(point => point.y));
    const maxX = Math.max(...points.map(point => point.x));
    const maxY = Math.max(...points.map(point => point.y));
    const width = maxX - minX;
    const height = maxY - minY;

    // Create a new canvas for the cropped image with the size of the bounding box
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    cropCanvas.width = width;
    cropCanvas.height = height;

    // Draw the polygon path on the new canvas, adjusted for the bounding box
    cropCtx.beginPath();
    cropCtx.moveTo(points[0].x - minX, points[0].y - minY);
    points.forEach(point => cropCtx.lineTo(point.x - minX, point.y - minY));
    cropCtx.closePath();
    cropCtx.clip();

    // Draw the image into the cropped canvas, adjusted for the bounding box
    cropCtx.drawImage(image, -minX, -minY);

    // Create a new image element to show the cropped area
    const croppedImage = new Image();
    croppedImage.src = cropCanvas.toDataURL();
    setImageSrc(croppedImage.src);
    setImages([...images, croppedImage.src]);
    setPoints([]);

    // Sending image to the server using axios
    axios.post('https://d00c-2409-40c1-1008-97aa-8e5f-fbae-8044-f3b8.ngrok-free.app/predict', { image: cropCanvas.toDataURL() })
    .then(res => {
        console.log(res.data);
        setPrediction(res.data.modelOutput);
      })
      .catch(err => {
        console.log(err);
        setPrediction('Something went wrong.');
      })
      .finally(() => {
        setIspredicting(false);
      });
    };


  function clearPoints() {
    setPoints([]);
    // reset the canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = imageRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
  }



  // if user drops the image file then it will be uploaded
  useEffect(() => {
    const dropArea = document.querySelector('.dropArea');
    dropArea.addEventListener('dragover', (event) => {
      event.preventDefault();
      dropArea.classList.add('active');
    });
    dropArea.addEventListener('dragleave', () => {
      dropArea.classList.remove('active');
    });
    dropArea.addEventListener('drop', (event) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {

          // check if the file is an image by extension of .jpg, .png
          if (!file.name.match(/\.(jpg|jpeg|png)$/)) {
            alert('Please upload an image file');
            return;
          }


          const imageUrl = e.target.result;
          setImageSrc(imageUrl);
          setImages([...images, imageUrl]);
        };
        reader.readAsDataURL(file);
      }
      dropArea.classList.remove('active');
    });
  }, [images]);


  return (
    <>
      <div className="dashboard">
        <div className="left">
          {/* <img src="https://isro.hack2skill.com/2024/assests/images/cover-logo.png" className='logo' /> */}
          <h2 className='logo'> SurfaceScout </h2> 
          <input type="file" name="file" id="file" onChange={handleFileChange} />
          <h1></h1>
          <label htmlFor="file" className='dropArea'>Upload Mars image &nbsp; &nbsp; <svg width="25px" height="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15L12 2M12 2L15 5.5M12 2L9 5.5" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M8 22.0002H16C18.8284 22.0002 20.2426 22.0002 21.1213 21.1215C22 20.2429 22 18.8286 22 16.0002V15.0002C22 12.1718 22 10.7576 21.1213 9.8789C20.3529 9.11051 19.175 9.01406 17 9.00195M7 9.00195C4.82497 9.01406 3.64706 9.11051 2.87868 9.87889C2 10.7576 2 12.1718 2 15.0002L2 16.0002C2 18.8286 2 20.2429 2.87868 21.1215C3.17848 21.4213 3.54062 21.6188 4 21.749" stroke="#000000" stroke-width="1.5" stroke-linecap="round" />
          </svg> </label>
          <div className="images">
            {images.map((img, index) => (
              <img key={index} src={img} alt="Uploaded" onClick={() => updateImage(index)} />
            ))}
          </div>
        </div>
        <div className="right">
          <div className="parent">
            <div className="child second canvas"> 
                <div className="child first">
                  <p1 id="head-text"> You can draw polygon on interest area. </p1>
                </div>
              {imageSrc && (
                <>
                  <div className="cropping">
                    <div className="image-container">
                      <canvas ref={canvasRef} onClick={handleCanvasClick} />
                    </div>
                  </div>
                  <div className="child map-buttons">

                    {/* selection of model */}
                     Select Model:
                    <select name="model" id="model">
                      <option value="lunarSurface">Lunar Surface</option>
                      <option value="rockDetect">Rock Detection</option>
                    </select>

                    <div className="child third">
                      <button onClick={cropImage} className={`${ispredicting ? 'predicting' : 'follow'}`} > {`${ispredicting ? 'Predicting' : 'Predict'}`}
                      </button>
                      <button onClick={clearPoints} className='clear'>Clear Boundings</button>
                    </div>
                  </div>
                
            </>
            )
          }
          </div>

          </div>
        </div>
        <div className='afterPredict'>
          
          <h2> &nbsp; Prediction </h2>
          <h3 className='predictedClass'>Model Output: {prediction}</h3>
        </div>
      </div >
    </>
  );
};

export default Dashboard;
