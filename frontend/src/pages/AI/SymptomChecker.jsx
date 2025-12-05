import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Skeleton
} from '@mui/material';
import {
  Psychology,
  ExpandMore,
  TrendingUp,
  CompareArrows,
  Analytics,
  HealthAndSafety,
  Warning,
  CheckCircle,
  Info,
  Science,
  Memory,
  Timeline
} from '@mui/icons-material';
import { diseasePredictionAPI } from '../../services/api';

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [method, setMethod] = useState('ensemble');
  const [analysisType, setAnalysisType] = useState('ml');
  const [serviceHealth, setServiceHealth] = useState(null);

  // Check service health on component mount
  useEffect(() => {
    checkServiceHealth();
  }, []);

  const checkServiceHealth = async () => {
    try {
      const health = await diseasePredictionAPI.healthCheck();
      setServiceHealth(health);
    } catch (err) {
      console.error('Health check failed:', err);
      setServiceHealth({ message: 'Service unavailable' });
    }
  };

  const handlePredict = async () => {
    if (!symptoms.trim()) {
      setError('Please enter your symptoms');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await diseasePredictionAPI.predict(symptoms, method);
      setPrediction(result);
      setActiveTab(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to predict disease');
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!symptoms.trim()) {
      setError('Please enter your symptoms');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await diseasePredictionAPI.compare(symptoms);
      setComparison(result);
      setActiveTab(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to compare models');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      setError('Please enter your symptoms');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await diseasePredictionAPI.analyze(symptoms, analysisType);
      setAnalysis(result);
      setActiveTab(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const sampleSymptoms = [
    'I have high fever and body pain with headache',
    'Experiencing severe cough and cold symptoms',
    'Feeling nauseous with stomach ache and diarrhea',
    'Having chest pain and difficulty breathing',
    'Persistent headache with dizziness and fatigue'
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ mb: 4, p: 3, textAlign: 'center' }}>
        <Psychology sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          AI Disease Prediction
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Get AI-powered disease predictions from your symptom descriptions using advanced ML and DL models
        </Typography>

        {/* Service Health Status */}
        {serviceHealth && (
          <Alert
            severity={serviceHealth.message?.includes('healthy') ? 'success' : 'warning'}
            sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}
          >
            {serviceHealth.message}
          </Alert>
        )}
      </Paper>

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Describe Your Symptoms
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={4}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your symptoms in detail... (e.g., I have high fever, body pain, and headache)"
                variant="outlined"
                sx={{ mb: 2 }}
                inputProps={{ 'aria-label': 'Symptom description' }}
              />

              {/* Sample Symptoms */}
              <Typography variant="subtitle2" gutterBottom>
                Sample Symptoms (click to use):
              </Typography>
              <Box sx={{ mb: 2 }}>
                {sampleSymptoms.map((sample, index) => (
                  <Chip
                    key={index}
                    label={sample}
                    onClick={() => setSymptoms(sample)}
                    sx={{ m: 0.5, cursor: 'pointer' }}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>

              {/* Method Selection */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Prediction Method</InputLabel>
                <Select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  label="Prediction Method"
                >
                  <MenuItem value="ensemble">Ensemble (ML + DL)</MenuItem>
                  <MenuItem value="ml">Machine Learning Only</MenuItem>
                  <MenuItem value="dl">Deep Learning Only</MenuItem>
                </Select>
              </FormControl>

              {/* Action Buttons */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handlePredict}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <HealthAndSafety />}
                    aria-label="Predict disease"
                  >
                    Predict
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleCompare}
                    disabled={loading}
                    startIcon={<CompareArrows />}
                    aria-label="Compare models"
                  >
                    Compare
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleAnalyze}
                    disabled={loading}
                    startIcon={<Analytics />}
                    aria-label="Analyze features"
                  >
                    Analyze
                  </Button>
                </Grid>
              </Grid>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Prediction Results
              </Typography>

              {(prediction || comparison || analysis) && (
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                  <Tab label="Prediction" icon={<HealthAndSafety />} />
                  <Tab label="Comparison" icon={<CompareArrows />} />
                  <Tab label="Analysis" icon={<Analytics />} />
                </Tabs>
              )}

              {loading && (
                <Box sx={{ mt: 2 }}>
                  <Skeleton width={220} height={32} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 1, mb: 2 }} />
                  <Skeleton width="60%" height={20} />
                  <Skeleton width="40%" height={20} />
                </Box>
              )}

              {/* Prediction Results */}
              {activeTab === 0 && prediction && (
                <Box sx={{ mt: 2 }} aria-live="polite" aria-relevant="additions text" aria-label="Prediction result">
                  <Alert
                    severity={getConfidenceColor(prediction.confidence)}
                    sx={{ mb: 2 }}
                    icon={<HealthAndSafety />}
                  >
                    <Typography variant="h6">
                      {prediction.predictedDisease}
                    </Typography>
                    <Typography variant="body2">
                      {getConfidenceLabel(prediction.confidence)} ({(prediction.confidence * 100).toFixed(1)}%)
                    </Typography>
                  </Alert>

                  <LinearProgress
                    variant="determinate"
                    value={prediction.confidence * 100}
                    color={getConfidenceColor(prediction.confidence)}
                    sx={{ mb: 2, height: 8, borderRadius: 4 }}
                  />

                  {/* Top Predictions */}
                  {prediction.topPredictions && prediction.topPredictions.length > 1 && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>Alternative Predictions</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List>
                          {prediction.topPredictions.slice(1).map((pred, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <TrendingUp color="primary" />
                              </ListItemIcon>
                              <ListItemText
                                primary={pred.disease}
                                secondary={`Confidence: ${(pred.confidence * 100).toFixed(1)}%`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {/* Model Information */}
                  <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Model Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Method: {prediction.modelType || method}
                    </Typography>
                    {prediction.ensembleMethod && (
                      <Typography variant="body2" color="text.secondary">
                        Ensemble: {prediction.ensembleMethod}
                      </Typography>
                    )}
                    {prediction.timestamp && (
                      <Typography variant="body2" color="text.secondary">
                        Generated: {new Date(prediction.timestamp).toLocaleString()}
                      </Typography>
                    )}
                  </Paper>
                </Box>
              )}

              {/* Comparison Results */}
              {activeTab === 1 && comparison && (
                <Box sx={{ mt: 2 }} aria-live="polite" aria-label="Model comparison results">
                  <Grid container spacing={2}>
                    {/* ML Prediction */}
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, border: '1px solid', borderColor: 'primary.main' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Science color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6">ML Model</Typography>
                        </Box>
                        {comparison.mlPrediction && (
                          <>
                            <Typography variant="body1" fontWeight="bold">
                              {comparison.mlPrediction.predicted_disease}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Confidence: {(comparison.mlPrediction.confidence * 100).toFixed(1)}%
                            </Typography>
                          </>
                        )}
                      </Paper>
                    </Grid>

                    {/* DL Prediction */}
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, border: '1px solid', borderColor: 'secondary.main' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Memory color="secondary" sx={{ mr: 1 }} />
                          <Typography variant="h6">DL Model</Typography>
                        </Box>
                        {comparison.dlPrediction && (
                          <>
                            <Typography variant="body1" fontWeight="bold">
                              {comparison.dlPrediction.predicted_disease}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Confidence: {(comparison.dlPrediction.confidence * 100).toFixed(1)}%
                            </Typography>
                          </>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Agreement Analysis */}
                  {comparison.agreement !== null && (
                    <Alert
                      severity={comparison.agreement ? 'success' : 'warning'}
                      sx={{ mt: 2 }}
                    >
                      <Typography variant="body1">
                        {comparison.agreement
                          ? 'Both models agree on the prediction'
                          : 'Models have different predictions'}
                      </Typography>
                      {comparison.confidenceDifference && (
                        <Typography variant="body2">
                          Confidence difference: {(Math.abs(comparison.confidenceDifference) * 100).toFixed(1)}%
                        </Typography>
                      )}
                    </Alert>
                  )}
                </Box>
              )}

              {/* Analysis Results */}
              {activeTab === 2 && analysis && (
                <Box sx={{ mt: 2 }} aria-live="polite" aria-label="Analysis results">
                  <FormControl size="small" sx={{ mb: 2, minWidth: 120 }}>
                    <InputLabel>Analysis Type</InputLabel>
                    <Select
                      value={analysisType}
                      onChange={(e) => setAnalysisType(e.target.value)}
                      label="Analysis Type"
                    >
                      <MenuItem value="ml">ML Features</MenuItem>
                      <MenuItem value="dl">DL Words</MenuItem>
                    </Select>
                  </FormControl>

                  <Typography variant="h6" gutterBottom>
                    Prediction: {analysis.predictedDisease}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Confidence: {(analysis.confidence * 100).toFixed(1)}%
                  </Typography>

                  {/* Feature/Word Importance */}
                  {analysisType === 'ml' && analysis.featureImportance && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Important Features
                      </Typography>
                      <List>
                        {analysis.featureImportance.slice(0, 10).map((feature, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <Timeline color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={feature.feature}
                              secondary={`Importance: ${(feature.importance * 100).toFixed(2)}%`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {analysisType === 'dl' && analysis.wordImportance && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Important Words
                      </Typography>
                      <List>
                        {analysis.wordImportance.slice(0, 10).map((word, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <Timeline color="secondary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={word.word}
                              secondary={`Importance: ${(word.importance * 100).toFixed(2)}%`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              )}

              {/* No Results Message */}
              {!prediction && !comparison && !analysis && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Info sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Enter your symptoms and click a button to get AI predictions
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Disclaimer */}
      <Alert severity="warning" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Medical Disclaimer:</strong> This AI prediction tool is for informational purposes only and should not replace professional medical advice.
          Always consult with a qualified healthcare provider for proper diagnosis and treatment.
        </Typography>
      </Alert>
    </Box>
  );
};

export default SymptomChecker;
