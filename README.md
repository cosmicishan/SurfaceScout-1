# Synapse'24 Hackathon
**Lunar Surface Classification and Rock Detection with Bounding Boxes**

## Project is live at [here](https://hirenlimbad.github.io/SurfaceScout/)
- Our Machine Learning model runs locally via a Flask API. Due to limitations in the hosting service, we couldn't host it live online.

## Project Overview
This project, developed for the Synapse'24 Hackathon at DA-IICT, presents a web application that combines a pre-trained Vision Transformer (ViT) model for lunar surface classification with an additional rock detection feature using bounding boxes.

![Screenshot 2024-08-11 091247](https://github.com/user-attachments/assets/e3feeb09-2d98-40cf-a0c6-207ea54de942)
![Screenshot 2024-08-10 171218](https://github.com/user-attachments/assets/e58bac46-117f-40c7-8d8e-4964277757f7)
![Screenshot 2024-08-10 172230](https://github.com/user-attachments/assets/5eb92420-12cb-451c-ac51-46edca71431d)
![Screenshot 2024-08-10 172107](https://github.com/user-attachments/assets/1984f7b1-6831-4efb-8fc7-96ceacc14aff)
![Screenshot 2024-08-11 085608](https://github.com/user-attachments/assets/72a20009-ffec-48f9-8f23-7630f9afd43b)





## Key Features

Lunar Surface Classification: Accepts an image and predicts its lunar surface type using a fine-tuned ViT model.
Rock Detection with Bounding Boxes: Identifies rocks within the lunar image and marks them with bounding boxes for visual clarity.
User-Friendly Interface: Provides a MERN stack-based web app where users can:
 * Choose between lunar surface classification and rock detection models.
  * Upload an image for analysis.
  * Crop a specific area of interest within the image for more focused prediction.

## Project Structure

The project files:

* app.py: Flask API that integrates the model's results into the MERN app.
* testing_model.ipynb: Jupyter Notebook for evaluating the ViT model's performance on lunar surface classification tasks.
* my-app: It's a MERN Stack app that let user choose model and upload image.
* rock_segmentation.ipynb: This Jupyter Notebook contains code for building and testing the rock segmentation model.
* best.pt: This file stores the best weights achieved by the YOLO model for rock detection and segmentation.
* yolo8n-seg.pt: This file holds the pre-trained YOLO model used for rock detection and segmentation.

## User Guide

1. Choosing the Model:

![Screenshot 2024-08-11 093143](https://github.com/user-attachments/assets/d3f61c6f-b896-4955-b3e1-82a5f3c41523)

Upon launching the web app, users will be presented with a clear interface allowing them to select the desired model:

Lunar Surface Classification: This option leverages the ViT model to classify the uploaded image's lunar surface type.
Rock Detection: This option employs the rock detection feature to identify and mark rocks with bounding boxes within the image.

2. Uploading an Image:

Once the model is chosen, users can click on a designated "Browse" or "Upload" button to select an image from their local storage. The chosen image will be displayed on the app's interface.

3. Cropping (Optional):
![Polygon](https://github.com/user-attachments/assets/06450309-1740-48c1-9ca3-81d076098a11)


For more precise analysis, users can utilize a cropping functionality (if implemented) to define a specific area within the image for the model to focus on. This is particularly beneficial when dealing with complex images containing multiple elements.

4. Processing and Results:

Upon clicking a "Submit" or "Analyze" button, the selected model will be applied to the image (entire image or cropped area, depending on user selection).
If performing lunar surface classification, the model will predict and display the most likely type of lunar surface present in the image.
For rock detection, the model will identify rocks within the image and generate bounding boxes around them, visually highlighting their locations.

![Screenshot 2024-08-11 085832](https://github.com/user-attachments/assets/75569a2a-7af7-4bae-9ee8-1df657ba9e8a)
![Rock detected](https://github.com/user-attachments/assets/98629364-628b-45bc-921d-2dad8aede4c3)



### Contributors:

- Ishan Purohit (Deep Learning Engineer)
- [Hiren Limbad](https://github.com/hirenlimbad) (Mern Stack Developer)
