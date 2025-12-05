/**
 * Patient Symptom Analyzer Component
 * Allows patients to input symptoms and get doctor specialization recommendations
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Stethoscope, Brain, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PatientSymptomAnalyzer = () => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      toast.error('Please enter your symptoms');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/ml/predict/patient-specialization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: symptoms.trim(),
          top_k: 3
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze symptoms');
      }

      setResults(data);
      toast.success('Analysis completed successfully!');
    } catch (err) {
      console.error('Error analyzing symptoms:', err);
      setError(err.message);
      toast.error('Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSpecializationIcon = (specialization) => {
    const icons = {
      'Cardiology': '❤️',
      'Neurology': '🧠',
      'Pulmonology': '🫁',
      'Gastroenterology': '🍽️',
      'Dermatology': '🧴',
      'Orthopedics': '🦴',
      'Psychiatry': '🧘',
      'Ophthalmology': '👁️',
      'ENT': '👂',
      'Internal Medicine': '🩺',
      'General Practice': '👨‍⚕️'
    };
    return icons[specialization] || '🩺';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-blue-600" />
            Symptom Analysis & Doctor Recommendation
          </CardTitle>
          <p className="text-gray-600">
            Describe your symptoms and get AI-powered recommendations for the most appropriate medical specializations.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
              Describe Your Symptoms
            </label>
            <Textarea
              id="symptoms"
              placeholder="Please describe your symptoms in detail. For example: 'I have been experiencing severe chest pain and shortness of breath for the past 2 days, especially when walking upstairs...'"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={4}
              className="w-full"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Be as specific as possible about your symptoms, their duration, and severity.
            </p>
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={loading || !symptoms.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Symptoms...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Analyze Symptoms
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Recommended Medical Specializations
            </CardTitle>
            {results.note && (
              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                {results.note}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.specializations && results.specializations.length > 0 ? (
                <>
                  <div className="grid gap-4">
                    {results.specializations.map((spec, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getSpecializationIcon(spec.specialization)}
                          </span>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {spec.specialization}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Rank #{index + 1} recommendation
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            className={`${getConfidenceColor(spec.confidence)} mb-1`}
                          >
                            {spec.percentage?.toFixed(1)}% match
                          </Badge>
                          <p className="text-xs text-gray-500">
                            Confidence: {(spec.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {results.keyword_recommendations && results.keyword_recommendations.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Additional Keyword-Based Recommendations:
                      </h4>
                      <div className="space-y-2">
                        {results.keyword_recommendations.map((rec, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-blue-800">
                              {getSpecializationIcon(rec.specialization)} {rec.specialization}
                            </span>
                            <span className="text-sm text-blue-600">
                              {rec.reason}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">Next Steps:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Book an appointment with a doctor from the recommended specialization</li>
                      <li>• Prepare a detailed list of your symptoms and their timeline</li>
                      <li>• Bring any relevant medical history or previous test results</li>
                      <li>• Consider seeking urgent care if symptoms are severe or worsening</li>
                    </ul>
                  </div>

                  <div className="mt-4 text-xs text-gray-500 border-t pt-4">
                    <p>
                      <strong>Processed symptoms:</strong> {results.processed_symptoms}
                    </p>
                    <p>
                      <strong>Analysis confidence:</strong> {(results.confidence * 100).toFixed(1)}%
                    </p>
                    <p>
                      <strong>Model version:</strong> {results.model_version}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No specialization recommendations found.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Please try describing your symptoms in more detail.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Important Disclaimer:</p>
              <p>
                This AI-powered analysis is for informational purposes only and should not replace professional medical advice. 
                Always consult with a qualified healthcare provider for proper diagnosis and treatment. 
                In case of emergency, contact emergency services immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientSymptomAnalyzer;
