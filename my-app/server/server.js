
const express = require('express');
const cors = require('cors');
const app = express();
const axios = require('axios');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3000'
}));


app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/predict', (req, res) => {
    console.log("request are here");
    // making a prediction through the flask server
    const image = req.body.image;
    console.log(image);

    let flasklink = 'https://eeac-2409-40c1-1008-97aa-2873-d38a-9bff-226a.ngrok-free.app/predict';
    axios.post(flasklink, { image: image })
    .then(response => {
        console.log(response.data.modelOutput);
        res.json({ modelOutput: response.data });
    })
    .catch(error => {
        console.log(error);
        res.json({ modelOutput: 'Error in prediction' });
    });
});


app.listen(3001, () => {
    console.log('Server is running on port 3001');
}
);
