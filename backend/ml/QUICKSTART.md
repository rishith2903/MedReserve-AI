# MedReserve AI ML Service - Quick Start Guide

Get the service running in under 5 minutes!

## Prerequisites

- Docker installed (recommended) OR
- Python 3.11+ and pip

## Option 1: Docker (Recommended)

### Development Mode
```bash
# Build and run
docker build -t medreserve-ml .
docker run -p 5001:5001 medreserve-ml

# Test
curl http://localhost:5001/health
```

### Production Mode
```bash
# Build production image
docker build -f Dockerfile.production -t medreserve-ml:prod .

# Run with production settings
docker run -d \
  --name medreserve-ml \
  -p 5001:5001 \
  -e LOG_LEVEL=INFO \
  --restart unless-stopped \
  medreserve-ml:prod

# Check health
curl http://localhost:5001/health
```

## Option 2: Local Python

### Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (use optimized requirements)
pip install -r requirements-optimized.txt

# Download NLTK data
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"

# Train models (first time only)
python train_all_models.py

# Start service
python start.py
```

### Access
Service runs on: http://localhost:5001

## Quick API Test

### Test Specialization Prediction
```bash
curl -X POST http://localhost:5001/predict/specialization \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": "chest pain and shortness of breath",
    "top_k": 3
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "request_id": "spec_20241023_100000",
  "data": {
    "specializations": [
      {"specialization": "Cardiology", "confidence": 0.89, "percentage": 89.0},
      {"specialization": "Pulmonology", "confidence": 0.72, "percentage": 72.0},
      {"specialization": "Internal Medicine", "confidence": 0.65, "percentage": 65.0}
    ]
  }
}
```

### Test Diagnosis Prediction
```bash
curl -X POST http://localhost:5001/predict/diagnosis \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": "fever, cough, and difficulty breathing",
    "top_diseases": 3,
    "top_medicines": 3
  }'
```

## Troubleshooting

### Port Already in Use
```bash
# Change port
export PORT=5002
python start.py
```

### Models Not Found
```bash
# Train models
python train_all_models.py
```

### NLTK Data Missing
```bash
# Download manually
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"
```

## Next Steps

1. **Read Full Documentation**: See `README-PRODUCTION.md`
2. **Deploy to Production**: See `DEPLOYMENT-GUIDE.md`
3. **Review Improvements**: See `IMPROVEMENTS-SUMMARY.md`

## Common Commands

```bash
# Check service health
curl http://localhost:5001/health

# View model information
curl http://localhost:5001/models/info

# View logs (Docker)
docker logs -f medreserve-ml

# Stop service (Docker)
docker stop medreserve-ml

# Clean up project
./cleanup_project.sh
```

## Development Tips

- Use `LOG_LEVEL=DEBUG` for detailed logging
- Models train automatically on first prediction if missing
- Fallback mode activates if models unavailable
- Use batch endpoints for multiple predictions

## Need Help?

- API Documentation: `README-PRODUCTION.md`
- Deployment Guide: `DEPLOYMENT-GUIDE.md`
- Improvements List: `IMPROVEMENTS-SUMMARY.md`

---

**You're ready to go! 🚀**
