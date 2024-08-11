from flask import Flask, request, jsonify
from PIL import Image
import io
import base64
from flask_cors import CORS

from transformers import ViTModel
from torch import nn

import os
import numpy as np

import torch
from torch import nn
from torchvision import transforms
from PIL import Image
from transformers import ViTModel

from inference_sdk import InferenceHTTPClient

from ultralytics import YOLO

import cv2

app = Flask(__name__)
CORS(app)

CLIENT = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key="UDBllPiVKHipSlYi7N2u"
)


model = YOLO("/home/ishan/Projects/Flask/best.pt")

class Classifier(nn.Module):
    def __init__(self, config, num_labels):
        super(Classifier, self).__init__()
        self.vit = ViTModel(config)
        self.dropout = nn.Dropout(0.1)
        self.classifier = nn.Linear(self.vit.config.hidden_size, num_labels)

    def forward(self, inputs):
        outputs = self.vit(inputs)
        output = self.dropout(outputs.last_hidden_state[:, 0])
        logits = self.classifier(output)
        logits = torch.nn.functional.softmax(logits, dim=1)
        return logits
    
class ViTForImageClassification(nn.Module):

    def __init__(self, num_labels=3):

        super(ViTForImageClassification, self).__init__()
        self.vit = ViTModel.from_pretrained('google/vit-large-patch16-224-in21k')
        self.dropout = nn.Dropout(0.1)
        self.classifier = nn.Linear(self.vit.config.hidden_size, num_labels)

    def forward(self, pixel_values):

        outputs = self.vit(pixel_values=pixel_values)
        output = self.dropout(outputs.last_hidden_state[:, 0])
        logits = self.classifier(output)
        logits = torch.nn.functional.softmax(logits, dim=1)
        return logits
    
def predict_class():

    model = torch.load(os.path.join("vit_zero_pretraining_hirise.pth"), map_location=torch.device('cpu'))
    model.eval()

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),         
        transforms.Normalize(mean=[0.5], std=[0.5])  
    ])

    image = Image.open('uploaded_image.jpg').convert('L')  

    input_tensor = transform(image).unsqueeze(0)  

    with torch.no_grad():
        output = model(input_tensor)

        label = output.cpu().detach().numpy()
        prediction = np.argmax(label)

    label_dict = {0: "Other", 1: "Crater", 2: "Dark dune", 3: "Slope Streak", 4: "Bright dune", 5: "Impact ejecta", 6: "Swiss cheese", 7: "Spider"}

    return label_dict[prediction]

@app.route('/predict', methods=['POST'])
def predict():

    try:
        try:
            data = request.json

            image_b64 = data.get('image')
            
            if not image_b64:
                return jsonify({"error": "No image provided"}), 400

            image_data = base64.b64decode(image_b64.split(",")[1])
        except Exception as e:
            print("Error on receiving image")
            
        try:
            image = Image.open(io.BytesIO(image_data))

            if image.mode == 'RGBA':
                image = image.convert('RGB')

            image_path = "uploaded_image.jpg"  
            image.save(image_path)

        except Exception as e:
            print(e)

        try:
            prediction = predict_class()
            print(prediction)
        except Exception as e:
            print("Error on prediction: ", e)    
        
        return jsonify({"modelOutput": prediction}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/rockPredict', methods=['POST'])
def rockPredict():
    
    try:

        data = request.json

        image_b64 = data.get('image')

        image_data = base64.b64decode(image_b64.split(",")[1])

        image = Image.open(io.BytesIO(image_data))

        if image.mode == 'RGBA':
                image = image.convert('RGB')

        image_path = "rock.jpg"  
        image.save(image_path)

        results = model.predict("/home/ishan/Projects/Flask/rock.jpg")

        for detection in results:
            bgr_array = detection.plot()
            rgb_array = bgr_array[..., ::-1]
            output_image = Image.fromarray(rgb_array)

        image_np = np.array(output_image)

        image_cv = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

        image_cv_rgb = cv2.cvtColor(image_cv, cv2.COLOR_BGR2RGB)
        image_pil = Image.fromarray(image_cv_rgb)
        
        img_io = io.BytesIO()
        image_pil.save(img_io, format='PNG')
        img_io.seek(0)

        img_base64 = base64.b64encode(img_io.getvalue()).decode('utf-8')

        return jsonify({"image": img_base64})

    except Exception as e:
        print(e)
        return jsonify({"error:" "No Class Found"})
    
@app.route('/rockBox', methods=['POST'])
def rockBox():

    try:

        data = request.json

        image_b64 = data.get('image')

        image_data = base64.b64decode(image_b64.split(",")[1])

        image = Image.open(io.BytesIO(image_data))

        if image.mode == 'RGBA':
                image = image.convert('RGB')

        image_path = "rock.jpg"  
        image.save(image_path)
        
        result = CLIENT.infer('rock.jpg', model_id="rockdetection-crmvk/2")
        predictions = result['predictions']

        image_cv = cv2.imread('rock.jpg')

        for pred in predictions:
            center_x = int(pred['x'])
            center_y = int(pred['y'])
            width = int(pred['width'])
            height = int(pred['height'])
            
            x1 = int(center_x - width / 2)
            y1 = int(center_y - height / 2)
            x2 = int(center_x + width / 2)
            y2 = int(center_y + height / 2)
            
            color = (0, 255, 0)  
            thickness = 2 
            cv2.rectangle(image_cv, (x1, y1), (x2, y2), color, thickness)

        image_cv_rgb = cv2.cvtColor(image_cv, cv2.COLOR_BGR2RGB)
        image_pil = Image.fromarray(image_cv_rgb)
        
        img_io = io.BytesIO()
        image_pil.save(img_io, format='PNG')
        img_io.seek(0)

        img_base64 = base64.b64encode(img_io.getvalue()).decode('utf-8')

        return jsonify({"image": img_base64})

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug= True)
    