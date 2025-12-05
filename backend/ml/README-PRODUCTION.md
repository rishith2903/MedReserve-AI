# MedReserve AI ML Service - Production Guide

A comprehensive machine learning service for medical diagnosis and doctor specialization recommendations.

## Features

- **Patient Specialization Prediction**: Recommends appropriate doctor specializations based on patient symptoms
- **Disease & Medicine Prediction**: Predicts potential diseases and suggests medicines based on symptoms
- **Batch Processing**: Support for bulk predictions
- **Fallback Mechanisms**: Rule-based fallbacks when ML models are unavailable
- **Comprehensive Validation**: Input sanitization and security measures
- **Production-Ready**: Optimized Docker configuration with health checks
- **Comprehensive Logging**: Structured logging with rotation

## Quick Start

### Using Docker (Recommended)

```bash
# Build the production image
docker build -f Dockerfile.production -t medreserve-ml:latest .

# Run the container
docker run -d \
  -p 5001:5001 \
  -e LOG_LEVEL=INFO \
  -e PORT=5001 \
  --name medreserve-ml \
  medreserve-ml:latest

# Check health
curl http://localhost:5001/health
```

### Local Development

```bash
# Install dependencies
pip install -r requirements-optimized.txt

# Train models (first time only)
python train_all_models.py

# Start the service
python start.py
```

## API Endpoints

### Health Check
```
GET /health
```

Returns service health status and model information.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-10-23T10:00:00",
  "models": {
    "specialization_loaded": true,
    "diagnosis_loaded": true
  }
}
```

### Predict Specialization
```
POST /predict/specialization
```

Predicts recommended doctor specializations based on symptoms.

**Request:**
```json
{
  "symptoms": "chest pain and shortness of breath",
  "top_k": 3
}
```

**Response:**
```json
{
  "success": true,
  "request_id": "spec_20241023_100000",
  "input_symptoms": "chest pain and shortness of breath",
  "data": {
    "specializations": [
      {
        "specialization": "Cardiology",
        "confidence": 0.89,
        "percentage": 89.0
      },
      {
        "specialization": "Pulmonology",
        "confidence": 0.72,
        "percentage": 72.0
      },
      {
        "specialization": "Internal Medicine",
        "confidence": 0.65,
        "percentage": 65.0
      }
    ],
    "confidence": 0.75,
    "processed_symptoms": "chest pain shortness breath"
  },
  "timestamp": "2024-10-23T10:00:00"
}
```

### Predict Diagnosis
```
POST /predict/diagnosis
```

Predicts diseases and recommends medicines based on symptoms.

**Request:**
```json
{
  "symptoms": "fever, cough, and difficulty breathing",
  "top_diseases": 5,
  "top_medicines": 5
}
```

**Response:**
```json
{
  "success": true,
  "request_id": "diag_20241023_100000",
  "input_symptoms": "fever, cough, and difficulty breathing",
  "data": {
    "diseases": [
      {
        "disease": "pneumonia",
        "confidence": 0.82,
        "percentage": 82.0
      },
      {
        "disease": "bronchitis",
        "confidence": 0.71,
        "percentage": 71.0
      }
    ],
    "medicines": [
      {
        "medicine": "amoxicillin",
        "confidence": 0.78,
        "percentage": 78.0
      },
      {
        "medicine": "azithromycin",
        "confidence": 0.65,
        "percentage": 65.0
      }
    ],
    "confidence": 0.77
  },
  "timestamp": "2024-10-23T10:00:00"
}
```

### Batch Specialization Prediction
```
POST /predict/batch/specialization
```

Process multiple symptom descriptions in one request.

**Request:**
```json
{
  "symptoms_list": [
    "chest pain and shortness of breath",
    "severe headache and nausea",
    "skin rash with itching"
  ],
  "top_k": 3
}
```

### Batch Diagnosis Prediction
```
POST /predict/batch/diagnosis
```

Process multiple diagnosis requests in one call.

**Request:**
```json
{
  "symptoms_list": [
    "fever and cough",
    "abdominal pain and nausea",
    "joint pain and stiffness"
  ],
  "top_diseases": 5,
  "top_medicines": 5
}
```

### Model Information
```
GET /models/info
```

Get information about loaded models and their capabilities.

## Configuration

### Environment Variables

- `PORT`: Service port (default: 5001)
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- `DEBUG`: Enable debug mode (default: False)
- `NLTK_DATA`: Path to NLTK data directory

### Input Validation

The service enforces strict input validation:

- **Symptom Length**: 5-2000 characters
- **Top K**: 1-10 for specializations, 1-20 for diagnoses
- **Batch Size**: Maximum 50 items
- **Character Filtering**: Alphanumeric and common punctuation only
- **Security**: XSS and injection attack prevention

## Architecture

```
medreserve-ml/
├── api/
│   ├── ml_api.py           # Main Flask API
│   └── simple_ml_api.py    # Fallback API
├── nlp/
│   └── nlp_pipeline.py     # NLP preprocessing
├── predict/
│   ├── predict_specialization.py
│   └── predict_disease_medicine.py
├── train/
│   ├── train_patient_model.py
│   └── train_doctor_model.py
├── utils/
│   ├── validation.py       # Input validation
│   ├── logging_config.py   # Logging setup
│   └── mapping_specialization.py
├── models/                 # Trained models
├── dataset/                # Training data
└── logs/                   # Log files
```

## Model Training

### Training All Models

```bash
python train_all_models.py
```

This will:
1. Generate sample medical data
2. Train patient-to-specialization model
3. Train doctor diagnosis models
4. Save models to `models/` directory

### Custom Training

```python
from train.train_patient_model import PatientSpecializationModel

# Train patient model
model = PatientSpecializationModel()
model.load_and_prepare_data()
model.train_model(symptoms_df, specializations_df)
model.save_model()
```

## Performance & Scaling

### Resource Requirements

- **Memory**: 512MB minimum, 1GB recommended
- **CPU**: 1 core minimum, 2+ cores recommended
- **Disk**: 500MB for models and dependencies

### Optimization Tips

1. **Use Production Dockerfile**: Optimized multi-stage build
2. **Enable Caching**: Models are loaded once at startup
3. **Batch Requests**: Use batch endpoints for multiple predictions
4. **Health Checks**: Configure appropriate timeouts

### Gunicorn Configuration

```bash
gunicorn \
  --bind 0.0.0.0:5001 \
  --workers 2 \
  --threads 4 \
  --timeout 120 \
  api.ml_api:app
```

## Security

### Implemented Measures

- Non-root user in Docker container
- Input sanitization and validation
- XSS attack prevention
- Injection attack detection
- Rate limiting ready (configure reverse proxy)
- HTTPS recommended for production

### Recommendations

1. Use HTTPS in production
2. Implement API key authentication
3. Add rate limiting
4. Regular security updates
5. Monitor logs for suspicious activity

## Monitoring & Logging

### Log Files

Logs are stored in `logs/` directory with rotation:
- Max file size: 10MB
- Backup count: 5 files
- Format: Structured with timestamps

### Health Monitoring

```bash
# Check service health
curl http://localhost:5001/health

# Check Docker container
docker ps
docker logs medreserve-ml
```

### Metrics

The service logs:
- Request duration
- Prediction confidence
- Error rates
- Model loading status

## Troubleshooting

### Models Not Loading

```bash
# Check if models exist
ls -la models/

# Retrain models
python train_all_models.py
```

### NLTK Data Missing

```bash
# Download NLTK data manually
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"
```

### Port Already in Use

```bash
# Change port
export PORT=5002
python start.py
```

### Memory Issues

- Reduce number of Gunicorn workers
- Use simple_ml_api.py for lower resource usage
- Increase Docker memory limits

## Development

### Running Tests

```bash
pytest -v
```

### Code Quality

```bash
# Format code
black .

# Lint code
flake8 .
```

## Support & Contribution

For issues, questions, or contributions:
1. Check existing documentation
2. Review logs for errors
3. Submit detailed bug reports
4. Include system information

## License

Copyright © 2024 MedReserve AI. All rights reserved.

## Disclaimer

This is a medical ML service for educational and research purposes. It should NOT be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions regarding a medical condition.
