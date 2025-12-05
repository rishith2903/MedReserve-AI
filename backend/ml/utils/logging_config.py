"""
Logging Configuration for MedReserve AI ML Service
Provides comprehensive logging with rotation and structured output
"""

import logging
import logging.handlers
import os
import sys
from datetime import datetime
from typing import Optional


class ColoredFormatter(logging.Formatter):
    """Custom formatter with color coding for console output"""

    # ANSI color codes
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
        'RESET': '\033[0m'        # Reset
    }

    def format(self, record):
        # Add color to levelname
        levelname = record.levelname
        if levelname in self.COLORS:
            record.levelname = f"{self.COLORS[levelname]}{levelname}{self.COLORS['RESET']}"

        return super().format(record)


def setup_logging(
    log_level: str = "INFO",
    log_file: Optional[str] = None,
    log_dir: str = "logs",
    enable_console: bool = True,
    enable_file: bool = True
) -> logging.Logger:
    """
    Setup comprehensive logging configuration

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Log file name (auto-generated if None)
        log_dir: Directory for log files
        enable_console: Enable console logging
        enable_file: Enable file logging

    Returns:
        Configured logger instance
    """

    # Create logs directory
    if enable_file:
        os.makedirs(log_dir, exist_ok=True)

    # Convert log level string to constant
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)

    # Create logger
    logger = logging.getLogger('medreserve_ml')
    logger.setLevel(numeric_level)

    # Remove existing handlers
    logger.handlers = []

    # Create formatters
    console_formatter = ColoredFormatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    file_formatter = logging.Formatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # Console handler
    if enable_console:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(numeric_level)
        console_handler.setFormatter(console_formatter)
        logger.addHandler(console_handler)

    # File handler with rotation
    if enable_file:
        if log_file is None:
            log_file = f"medreserve_ml_{datetime.now().strftime('%Y%m%d')}.log"

        log_path = os.path.join(log_dir, log_file)

        # Rotating file handler (10MB per file, keep 5 backups)
        file_handler = logging.handlers.RotatingFileHandler(
            log_path,
            maxBytes=10 * 1024 * 1024,  # 10 MB
            backupCount=5,
            encoding='utf-8'
        )
        file_handler.setLevel(numeric_level)
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)

    # Prevent propagation to root logger
    logger.propagate = False

    return logger


def get_logger(name: str = 'medreserve_ml') -> logging.Logger:
    """
    Get or create a logger instance

    Args:
        name: Logger name

    Returns:
        Logger instance
    """
    logger = logging.getLogger(name)

    # If logger has no handlers, set up default configuration
    if not logger.handlers:
        setup_logging()

    return logger


class RequestLogger:
    """Logger for API requests with structured output"""

    def __init__(self, logger: Optional[logging.Logger] = None):
        self.logger = logger or get_logger()

    def log_request(
        self,
        endpoint: str,
        method: str,
        status_code: int,
        duration_ms: float,
        error: Optional[str] = None
    ):
        """
        Log API request details

        Args:
            endpoint: API endpoint
            method: HTTP method
            status_code: Response status code
            duration_ms: Request duration in milliseconds
            error: Error message if any
        """
        log_data = {
            'endpoint': endpoint,
            'method': method,
            'status_code': status_code,
            'duration_ms': f'{duration_ms:.2f}',
            'timestamp': datetime.now().isoformat()
        }

        if error:
            log_data['error'] = error

        log_message = ' | '.join([f'{k}={v}' for k, v in log_data.items()])

        if status_code >= 500:
            self.logger.error(f"REQUEST ERROR: {log_message}")
        elif status_code >= 400:
            self.logger.warning(f"REQUEST WARNING: {log_message}")
        else:
            self.logger.info(f"REQUEST: {log_message}")

    def log_model_prediction(
        self,
        model_type: str,
        input_length: int,
        output_count: int,
        confidence: float,
        duration_ms: float
    ):
        """
        Log model prediction details

        Args:
            model_type: Type of model (specialization, diagnosis, etc.)
            input_length: Length of input text
            output_count: Number of predictions
            confidence: Prediction confidence
            duration_ms: Prediction duration in milliseconds
        """
        log_data = {
            'model_type': model_type,
            'input_length': input_length,
            'output_count': output_count,
            'confidence': f'{confidence:.3f}',
            'duration_ms': f'{duration_ms:.2f}',
            'timestamp': datetime.now().isoformat()
        }

        log_message = ' | '.join([f'{k}={v}' for k, v in log_data.items()])
        self.logger.info(f"PREDICTION: {log_message}")


# Example usage and testing
if __name__ == "__main__":
    # Setup logging
    logger = setup_logging(log_level="DEBUG", log_dir="logs")

    # Test different log levels
    logger.debug("This is a debug message")
    logger.info("This is an info message")
    logger.warning("This is a warning message")
    logger.error("This is an error message")
    logger.critical("This is a critical message")

    # Test request logger
    request_logger = RequestLogger(logger)

    request_logger.log_request(
        endpoint="/predict/specialization",
        method="POST",
        status_code=200,
        duration_ms=125.5
    )

    request_logger.log_request(
        endpoint="/predict/diagnosis",
        method="POST",
        status_code=400,
        duration_ms=50.2,
        error="Invalid input"
    )

    request_logger.log_model_prediction(
        model_type="specialization",
        input_length=150,
        output_count=3,
        confidence=0.85,
        duration_ms=75.3
    )

    print("\nLogging test complete. Check logs directory for output.")
