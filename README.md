# OncoSim AI Tumor Predictor

An AI-powered tumor prediction platform that uses machine learning to analyze medical data and estimate tumor likelihood. The system combines a FastAPI backend for model inference with a modern React frontend for interactive user input and visualization.

## Overview

OncoSim is designed as a full-stack machine learning application demonstrating how predictive healthcare models can be deployed as scalable web services. Users can input relevant clinical parameters through a web interface, which are processed by a trained machine learning model to generate predictions.

The project demonstrates practical integration of machine learning, backend APIs, and frontend applications.

## Features

* Machine learning–based tumor prediction
* FastAPI backend for inference APIs
* React frontend for user interaction
* Modular project architecture
* RESTful API endpoints
* Scalable deployment-ready design

## Project Structure

```
oncosim_project_structure
│
├── backend
│   └── app
│       ├── routes
│       ├── services
│       ├── config.py
│       └── main.py
│
├── frontend
│
├── model_training
│
├── scripts
│
└── docs
```

### Backend

The backend is built using FastAPI and serves as the API layer responsible for:

* Handling requests
* Running ML model inference
* Returning prediction results

### Frontend

The frontend provides a user-friendly interface built with React that allows users to input data and view prediction results.

### Model Training

Contains notebooks and scripts used to train and evaluate the tumor prediction model.

## Tech Stack

### Backend

* Python
* FastAPI
* Uvicorn
* Scikit-learn
* Pandas
* NumPy

### Frontend

* React
* TypeScript
* Vite

### Machine Learning

* Scikit-learn
* Pandas
* NumPy

### Deployment

* Render (backend)
* Vercel / Render (frontend)
* GitHub (version control)

## Installation

### Clone the repository

```
git clone https://github.com/Iamnamanpanday/oncosim_ai_tumor_predictor-.git
cd oncosim_ai_tumor_predictor-
```

## Backend Setup

```
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend server will run at:

```
http://127.0.0.1:8000
```

API documentation:

```
http://127.0.0.1:8000/docs
```

## Frontend Setup

```
cd frontend
npm install
npm run dev
```

The frontend will run at:

```
http://localhost:5173
```

## API Example

Example request:

```
POST /predict
```

Example response:

```
{
  "prediction": "benign",
  "probability": 0.87
}
```

## Future Improvements

* Improve model accuracy with larger datasets
* Add model explainability (SHAP / LIME)
* Implement user authentication
* Deploy model monitoring and logging
* Add visualization dashboards

## Author

Naman Panday

GitHub:
https://github.com/Iamnamanpanday

## License

This project is for research and educational purposes.
