"""
Flask API for MedReserve AI ML Models
Provides REST endpoints for patient specialization and doctor diagnosis predictions
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import logging
from datetime import datetime
import traceback

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from predict.predict_specialization import SpecializationPredictor, fallback_specialization_prediction
from predict.predict_disease_medicine import DiseaseMedicinePredictor
from utils.validation import InputValidator, create_validation_error
from utils.logging_config import setup_logging, RequestLogger

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logger = setup_logging(log_level=os.environ.get('LOG_LEVEL', 'INFO'))
request_logger = RequestLogger(logger)

# Initialize predictors
specialization_predictor = None
diagnosis_predictor = None

def initialize_models():
    """
    Initialize ML models on startup
    """
    global specialization_predictor, diagnosis_predictor

    try:
        # Check if models directory exists
        models_dir = "models"
        if not os.path.exists(models_dir):
            logger.warning(f"Models directory not found: {models_dir}")
            logger.info("Models will be trained on first prediction request")
            return

        # Initialize specialization predictor
        logger.info("Initializing specialization predictor...")
        specialization_predictor = SpecializationPredictor()
        try:
            specialization_predictor.load_model()
            logger.info("✅ Specialization model loaded successfully")
        except Exception as e:
            logger.warning(f"⚠️ Could not load specialization model: {e}")
            logger.info("Will use fallback prediction for specialization")
            specialization_predictor = None

        # Initialize diagnosis predictor
        logger.info("Initializing diagnosis predictor...")
        diagnosis_predictor = DiseaseMedicinePredictor()
        try:
            diagnosis_predictor.load_models()
            logger.info("✅ Diagnosis models loaded successfully")
        except Exception as e:
            logger.warning(f"⚠️ Could not load diagnosis models: {e}")
            logger.info("Will train new models on first prediction request")
            diagnosis_predictor = None

    except Exception as e:
        logger.error(f"❌ Error initializing models: {e}")
        logger.info("Models will be trained on demand")

def train_models_if_needed():
    """Train models if they don't exist or failed to load"""
    global specialization_predictor, diagnosis_predictor

    try:
        logger.info("🤖 Training models on demand...")

        # Import training modules
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from train_all_models import create_sample_medical_data, train_patient_model, train_doctor_model

        # Create sample data and train models
        patient_data, doctor_data = create_sample_medical_data()

        # Train patient model
        if train_patient_model(patient_data):
            specialization_predictor = SpecializationPredictor()
            specialization_predictor.load_model()
            logger.info("✅ Patient model trained and loaded")

        # Train doctor model
        if train_doctor_model(doctor_data):
            diagnosis_predictor = DiseaseMedicinePredictor()
            diagnosis_predictor.load_models()
            logger.info("✅ Doctor model trained and loaded")

        return True

    except Exception as e:
        logger.error(f"❌ Error training models: {e}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'models': {
            'specialization_loaded': specialization_predictor is not None and specialization_predictor.is_loaded,
            'diagnosis_loaded': diagnosis_predictor is not None and diagnosis_predictor.is_loaded
        }
    })

@app.route('/predict/specialization', methods=['POST'])
def predict_specialization():
    """
    Predict doctor specializations based on patient symptoms
    
    Expected JSON payload:
    {
        "symptoms": "patient symptom description",
        "top_k": 3  # optional, default 3
    }
    """
    try:
        # Validate request
        if not request.is_json:
            return create_validation_error('Request must be JSON')

        data = request.get_json()

        if 'symptoms' not in data:
            return create_validation_error('Missing required field: symptoms')

        # Validate and sanitize symptoms
        is_valid, error_msg, sanitized_symptoms = InputValidator.validate_symptoms(data['symptoms'])
        if not is_valid:
            return create_validation_error(error_msg)

        symptoms = sanitized_symptoms
        top_k = data.get('top_k', 3)

        # Validate top_k
        is_valid, error_msg, validated_top_k = InputValidator.validate_top_k(top_k, max_value=10)
        if not is_valid:
            return create_validation_error(error_msg)

        top_k = validated_top_k
        
        # Make prediction
        if specialization_predictor and hasattr(specialization_predictor, 'is_loaded') and specialization_predictor.is_loaded:
            result = specialization_predictor.predict_specializations(symptoms, top_k)
        else:
            # Try to train models if they don't exist
            if specialization_predictor is None:
                logger.info("Attempting to train models on demand...")
                if train_models_if_needed():
                    if specialization_predictor and hasattr(specialization_predictor, 'is_loaded') and specialization_predictor.is_loaded:
                        result = specialization_predictor.predict_specializations(symptoms, top_k)
                    else:
                        result = fallback_specialization_prediction(symptoms, top_k)
                        result['fallback'] = True
                else:
                    # Use fallback prediction
                    result = fallback_specialization_prediction(symptoms, top_k)
                    result['fallback'] = True
            else:
                # Use fallback prediction
                result = fallback_specialization_prediction(symptoms, top_k)
                result['fallback'] = True

        # Add request metadata and standardize response format
        response = {
            'success': True,
            'request_id': f"spec_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'input_symptoms': symptoms,
            'data': result,
            'timestamp': datetime.now().isoformat()
        }

        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in predict_specialization: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/predict/diagnosis', methods=['POST'])
def predict_diagnosis():
    """
    Predict diseases and medicines based on doctor-entered symptoms
    
    Expected JSON payload:
    {
        "symptoms": "doctor symptom description",
        "top_diseases": 5,  # optional, default 5
        "top_medicines": 5  # optional, default 5
    }
    """
    try:
        # Validate request
        if not request.is_json:
            return create_validation_error('Request must be JSON')

        data = request.get_json()

        if 'symptoms' not in data:
            return create_validation_error('Missing required field: symptoms')

        # Validate and sanitize symptoms
        is_valid, error_msg, sanitized_symptoms = InputValidator.validate_symptoms(data['symptoms'])
        if not is_valid:
            return create_validation_error(error_msg)

        symptoms = sanitized_symptoms
        top_diseases = data.get('top_diseases', 5)
        top_medicines = data.get('top_medicines', 5)

        # Validate top_diseases and top_medicines
        is_valid, error_msg, validated_diseases = InputValidator.validate_top_k(top_diseases, max_value=20)
        if not is_valid:
            return create_validation_error(f"top_diseases: {error_msg}")

        is_valid, error_msg, validated_medicines = InputValidator.validate_top_k(top_medicines, max_value=20)
        if not is_valid:
            return create_validation_error(f"top_medicines: {error_msg}")

        top_diseases = validated_diseases
        top_medicines = validated_medicines
        
        # Make prediction
        if diagnosis_predictor:
            result = diagnosis_predictor.predict_diagnosis(symptoms, top_diseases, top_medicines)
        else:
            # Initialize new predictor if needed
            temp_predictor = DiseaseMedicinePredictor()
            result = temp_predictor.predict_diagnosis(symptoms, top_diseases, top_medicines)
            result['fallback'] = True

        # Add request metadata and standardize response format
        response = {
            'success': True,
            'request_id': f"diag_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'input_symptoms': symptoms,
            'data': result,
            'timestamp': datetime.now().isoformat()
        }

        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in predict_diagnosis: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/models/info', methods=['GET'])
def get_models_info():
    """
    Get information about loaded models
    """
    try:
        info = {
            'specialization_model': None,
            'diagnosis_model': None,
            'timestamp': datetime.now().isoformat()
        }
        
        if specialization_predictor:
            info['specialization_model'] = specialization_predictor.get_model_info()
        
        if diagnosis_predictor:
            info['diagnosis_model'] = diagnosis_predictor.get_model_info()
        
        return jsonify(info)
        
    except Exception as e:
        logger.error(f"Error in get_models_info: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/predict/batch/specialization', methods=['POST'])
def batch_predict_specialization():
    """
    Batch prediction for multiple symptom descriptions
    
    Expected JSON payload:
    {
        "symptoms_list": ["symptom1", "symptom2", ...],
        "top_k": 3  # optional, default 3
    }
    """
    try:
        if not request.is_json:
            return jsonify({'error': 'Request must be JSON'}), 400
        
        data = request.get_json()
        
        if 'symptoms_list' not in data:
            return jsonify({'error': 'Missing required field: symptoms_list'}), 400
        
        symptoms_list = data['symptoms_list']
        top_k = data.get('top_k', 3)
        
        if not isinstance(symptoms_list, list) or len(symptoms_list) == 0:
            return jsonify({'error': 'symptoms_list must be a non-empty list'}), 400
        
        if len(symptoms_list) > 50:
            return jsonify({'error': 'Maximum 50 symptoms allowed per batch'}), 400
        
        # Make batch predictions
        results = []
        for symptoms in symptoms_list:
            if specialization_predictor and specialization_predictor.is_loaded:
                result = specialization_predictor.predict_specializations(symptoms, top_k)
            else:
                result = fallback_specialization_prediction(symptoms, top_k)
                result['fallback'] = True
            results.append(result)
        
        return jsonify({
            'results': results,
            'count': len(results),
            'request_id': f"batch_spec_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        })
        
    except Exception as e:
        logger.error(f"Error in batch_predict_specialization: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/predict/batch/diagnosis', methods=['POST'])
def batch_predict_diagnosis():
    """
    Batch prediction for multiple diagnosis requests
    
    Expected JSON payload:
    {
        "symptoms_list": ["symptom1", "symptom2", ...],
        "top_diseases": 5,  # optional, default 5
        "top_medicines": 5  # optional, default 5
    }
    """
    try:
        if not request.is_json:
            return jsonify({'error': 'Request must be JSON'}), 400
        
        data = request.get_json()
        
        if 'symptoms_list' not in data:
            return jsonify({'error': 'Missing required field: symptoms_list'}), 400
        
        symptoms_list = data['symptoms_list']
        top_diseases = data.get('top_diseases', 5)
        top_medicines = data.get('top_medicines', 5)
        
        if not isinstance(symptoms_list, list) or len(symptoms_list) == 0:
            return jsonify({'error': 'symptoms_list must be a non-empty list'}), 400
        
        if len(symptoms_list) > 20:
            return jsonify({'error': 'Maximum 20 symptoms allowed per batch'}), 400
        
        # Make batch predictions
        if diagnosis_predictor:
            results = diagnosis_predictor.batch_predict(symptoms_list, top_diseases, top_medicines)
        else:
            temp_predictor = DiseaseMedicinePredictor()
            results = temp_predictor.batch_predict(symptoms_list, top_diseases, top_medicines)
            for result in results:
                result['fallback'] = True
        
        return jsonify({
            'results': results,
            'count': len(results),
            'request_id': f"batch_diag_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        })
        
    except Exception as e:
        logger.error(f"Error in batch_predict_diagnosis: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'error': 'Method not allowed'}), 405

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


def analyze_symptoms_logic(symptoms):
    symptoms_lower = symptoms.lower()

    conditions = []
    if ('fever' in symptoms_lower) or ('temperature' in symptoms_lower):
        if ('cough' in symptoms_lower) or ('throat' in symptoms_lower):
            conditions.append({
                'name': 'Upper Respiratory Infection',
                'probability': 'High',
                'description': 'Common infection affecting nose, throat, and airways.'
            })
            conditions.append({
                'name': 'Influenza',
                'probability': 'Medium',
                'description': 'Viral infection with fever, aches, fatigue, and respiratory symptoms.'
            })
    if 'headache' in symptoms_lower:
        conditions.append({
            'name': 'Tension Headache',
            'probability': 'Medium',
            'description': 'Often caused by stress, muscle tension, or posture.'
        })
        if ('nausea' in symptoms_lower) or ('light' in symptoms_lower):
            conditions.append({
                'name': 'Migraine',
                'probability': 'Medium',
                'description': 'Moderate to severe headaches with sensitivity to light/sound.'
            })
    if ('stomach' in symptoms_lower) or ('abdominal' in symptoms_lower):
        conditions.append({
            'name': 'Gastroenteritis',
            'probability': 'Medium',
            'description': 'Inflammation of stomach and intestines causing pain, nausea, diarrhea.'
        })
    if ('chest pain' in symptoms_lower) or ('chest pressure' in symptoms_lower):
        conditions.append({
            'name': 'Cardiac Event (Requires Immediate Evaluation)',
            'probability': 'Unknown - Urgent Evaluation Needed',
            'description': 'Chest pain can indicate serious cardiac conditions. Immediate evaluation is essential.'
        })
    if not conditions:
        conditions.append({
            'name': 'General Malaise',
            'probability': 'Medium',
            'description': 'Non-specific symptoms with various possible causes.'
        })
        conditions.append({
            'name': 'Viral Infection',
            'probability': 'Low to Medium',
            'description': 'General symptoms may reflect common viral illness.'
        })
    conditions = conditions[:4]

    recommendations = []
    recommendations.append('Consult with a healthcare professional for proper diagnosis and treatment plan')
    if 'fever' in symptoms_lower:
        recommendations.append('Monitor temperature and stay hydrated')
        recommendations.append('Rest adequately')
    if 'pain' in symptoms_lower:
        recommendations.append('Track pain intensity, location, and triggers')
        recommendations.append('Consider OTC pain relief as appropriate (consult pharmacist)')
    if ('cough' in symptoms_lower) or ('throat' in symptoms_lower):
        recommendations.append('Stay hydrated; warm liquids can soothe throat irritation')
        recommendations.append('Avoid irritants like smoke and strong odors')
    recommendations.append('Document symptoms, onset, and changes in severity')
    recommendations.append('Seek immediate care if symptoms worsen or new concerning symptoms develop')
    recommendations = recommendations[:5]

    emergency_keywords = [
        'chest pain', 'difficulty breathing', "can't breathe", 'severe bleeding',
        'unconscious', 'seizure', 'stroke', 'heart attack', 'severe head injury',
        'severe abdominal pain', 'coughing blood', 'suicidal'
    ]
    for kw in emergency_keywords:
        if kw in symptoms_lower:
            urgency = 'Emergency - Seek immediate medical attention or call emergency services'
            break
    else:
        urgent_keywords = [
            'high fever', 'persistent vomiting', 'severe pain', 'confusion',
            'persistent diarrhea', 'dehydration', 'spreading rash'
        ]
        if any(kw in symptoms_lower for kw in urgent_keywords):
            urgency = 'Urgent - Consult healthcare provider within 24 hours'
        else:
            symptom_count = symptoms.count(',') + symptoms.count('and') + 1
            if symptom_count > 3:
                urgency = 'Routine - Schedule appointment with healthcare provider soon'
            else:
                urgency = 'Monitor - Track symptoms and consult healthcare provider if worsening or persistent'

    result = {
        'conditions': conditions,
        'recommendations': recommendations,
        'urgencyLevel': urgency,
        'disclaimer': 'This analysis is for educational purposes only and not a substitute for professional medical advice. Seek professional care as needed.'
    }
    return result

@app.route('/analyze-symptoms', methods=['POST'])
def analyze_symptoms():
    try:
        if not request.is_json:
            return jsonify({'error': 'Request must be JSON'}), 400
        data = request.get_json()
        if 'symptoms' not in data or not str(data['symptoms']).strip():
            return jsonify({'error': 'Symptoms and sessionId are required' if 'sessionId' in data else 'Symptoms are required'}), 400
        symptoms = str(data['symptoms']).strip()
        analysis = analyze_symptoms_logic(symptoms)
        return jsonify(analysis)
    except Exception as e:
        logger.error(f"Error in analyze_symptoms: {e}")
        logger.error(traceback.format_exc())
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500

if __name__ == '__main__':
    # Initialize models on startup
    initialize_models()
    
    # Run the Flask app
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    print(f"Starting MedReserve AI ML API on port {port}")
    print("Available endpoints:")
    print("  GET  /health - Health check")
    print("  POST /predict/specialization - Patient to specialization prediction")
    print("  POST /predict/diagnosis - Doctor to diagnosis prediction")
    print("  GET  /models/info - Model information")
    print("  POST /predict/batch/specialization - Batch specialization prediction")
    print("  POST /predict/batch/diagnosis - Batch diagnosis prediction")
    print("  POST /analyze-symptoms - Educational symptom analysis (project-compatible)")

    app.run(host='0.0.0.0', port=port, debug=debug)
