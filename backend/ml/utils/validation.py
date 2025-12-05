"""
Input Validation and Sanitization Utilities for MedReserve AI
Ensures data integrity and security for all API inputs
"""

import re
import html
from typing import Dict, Any, Tuple, Optional


class InputValidator:
    """
    Validates and sanitizes user inputs for medical ML API
    """

    # Maximum allowed lengths
    MAX_SYMPTOM_LENGTH = 2000
    MAX_BATCH_SIZE = 50
    MIN_SYMPTOM_LENGTH = 5

    # Allowed characters pattern (alphanumeric, spaces, common punctuation)
    ALLOWED_PATTERN = re.compile(r'^[a-zA-Z0-9\s\.,;:\-\(\)\'\"]+$')

    # Suspicious patterns that might indicate injection attempts
    SUSPICIOUS_PATTERNS = [
        re.compile(r'<script', re.IGNORECASE),
        re.compile(r'javascript:', re.IGNORECASE),
        re.compile(r'on\w+\s*=', re.IGNORECASE),  # Event handlers like onclick=
        re.compile(r'<iframe', re.IGNORECASE),
        re.compile(r'eval\s*\(', re.IGNORECASE),
        re.compile(r'exec\s*\(', re.IGNORECASE),
        re.compile(r'__import__', re.IGNORECASE),
    ]

    @staticmethod
    def sanitize_text(text: str) -> str:
        """
        Sanitize text input by removing potentially harmful content

        Args:
            text: Input text to sanitize

        Returns:
            Sanitized text string
        """
        if not isinstance(text, str):
            return ""

        # Remove HTML entities
        text = html.escape(text)

        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)

        # Trim whitespace
        text = text.strip()

        return text

    @staticmethod
    def validate_symptoms(symptoms: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Validate symptom input

        Args:
            symptoms: Symptom description string

        Returns:
            Tuple of (is_valid, error_message, sanitized_symptoms)
        """
        # Check if empty
        if not symptoms or not symptoms.strip():
            return False, "Symptoms cannot be empty", None

        # Sanitize first
        sanitized = InputValidator.sanitize_text(symptoms)

        # Check length constraints
        if len(sanitized) < InputValidator.MIN_SYMPTOM_LENGTH:
            return False, f"Symptoms must be at least {InputValidator.MIN_SYMPTOM_LENGTH} characters long", None

        if len(sanitized) > InputValidator.MAX_SYMPTOM_LENGTH:
            return False, f"Symptoms must not exceed {InputValidator.MAX_SYMPTOM_LENGTH} characters", None

        # Check for suspicious patterns
        for pattern in InputValidator.SUSPICIOUS_PATTERNS:
            if pattern.search(sanitized):
                return False, "Invalid characters detected in symptoms", None

        # Check allowed characters (relaxed for medical terms)
        # Allow alphanumeric, spaces, and common punctuation
        if not re.match(r'^[a-zA-Z0-9\s\.,;:\-\(\)\'\"!?/]+$', sanitized):
            return False, "Symptoms contain invalid characters", None

        return True, None, sanitized

    @staticmethod
    def validate_top_k(top_k: Any, max_value: int = 20) -> Tuple[bool, Optional[str], Optional[int]]:
        """
        Validate top_k parameter

        Args:
            top_k: The top_k value to validate
            max_value: Maximum allowed value

        Returns:
            Tuple of (is_valid, error_message, validated_top_k)
        """
        try:
            top_k_int = int(top_k)

            if top_k_int < 1:
                return False, "top_k must be at least 1", None

            if top_k_int > max_value:
                return False, f"top_k must not exceed {max_value}", None

            return True, None, top_k_int

        except (ValueError, TypeError):
            return False, "top_k must be a valid integer", None

    @staticmethod
    def validate_batch_request(symptoms_list: Any) -> Tuple[bool, Optional[str], Optional[list]]:
        """
        Validate batch prediction request

        Args:
            symptoms_list: List of symptom descriptions

        Returns:
            Tuple of (is_valid, error_message, validated_symptoms_list)
        """
        # Check if it's a list
        if not isinstance(symptoms_list, list):
            return False, "symptoms_list must be an array", None

        # Check batch size
        if len(symptoms_list) == 0:
            return False, "symptoms_list cannot be empty", None

        if len(symptoms_list) > InputValidator.MAX_BATCH_SIZE:
            return False, f"Batch size must not exceed {InputValidator.MAX_BATCH_SIZE}", None

        # Validate each symptom
        validated_symptoms = []
        for i, symptoms in enumerate(symptoms_list):
            is_valid, error_msg, sanitized = InputValidator.validate_symptoms(symptoms)

            if not is_valid:
                return False, f"Invalid symptoms at index {i}: {error_msg}", None

            validated_symptoms.append(sanitized)

        return True, None, validated_symptoms

    @staticmethod
    def validate_request_data(data: Any) -> Tuple[bool, Optional[str]]:
        """
        Validate that request contains valid JSON data

        Args:
            data: Request data to validate

        Returns:
            Tuple of (is_valid, error_message)
        """
        if data is None:
            return False, "Request body must be JSON"

        if not isinstance(data, dict):
            return False, "Request body must be a JSON object"

        return True, None


def create_error_response(error_message: str, status_code: int = 400) -> Tuple[Dict[str, Any], int]:
    """
    Create standardized error response

    Args:
        error_message: Error message to return
        status_code: HTTP status code

    Returns:
        Tuple of (error_dict, status_code)
    """
    from datetime import datetime

    return {
        'success': False,
        'error': error_message,
        'timestamp': datetime.now().isoformat()
    }, status_code


def create_validation_error(error_message: str) -> Tuple[Dict[str, Any], int]:
    """
    Create validation error response

    Args:
        error_message: Validation error message

    Returns:
        Tuple of (error_dict, status_code)
    """
    return create_error_response(error_message, 400)


# Example usage
if __name__ == "__main__":
    validator = InputValidator()

    # Test valid symptoms
    is_valid, error, sanitized = validator.validate_symptoms("chest pain and shortness of breath")
    print(f"Valid: {is_valid}, Sanitized: {sanitized}")

    # Test invalid symptoms (too short)
    is_valid, error, sanitized = validator.validate_symptoms("hi")
    print(f"Valid: {is_valid}, Error: {error}")

    # Test suspicious input
    is_valid, error, sanitized = validator.validate_symptoms("<script>alert('xss')</script>")
    print(f"Valid: {is_valid}, Error: {error}")

    # Test top_k validation
    is_valid, error, validated = validator.validate_top_k(5)
    print(f"Valid: {is_valid}, Validated: {validated}")

    # Test batch validation
    symptoms_list = ["chest pain", "headache and nausea", "skin rash"]
    is_valid, error, validated_list = validator.validate_batch_request(symptoms_list)
    print(f"Valid: {is_valid}, Count: {len(validated_list) if validated_list else 0}")
