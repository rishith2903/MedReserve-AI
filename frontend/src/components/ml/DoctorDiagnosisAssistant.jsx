/**
 * Doctor Diagnosis Assistant Component
 * Helps doctors analyze symptoms and get disease/medicine recommendations
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Loader2, Microscope, Pill, Activity, AlertCircle, CheckCircle, Stethoscope } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DoctorDiagnosisAssistant = () => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      toast.error('Please enter patient symptoms');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/ml/predict/doctor-diagnosis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: symptoms.trim(),
          top_diseases: 5,
          top_medicines: 5
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze symptoms');
      }

      setResults(data);
      toast.success('Diagnosis analysis completed!');
    } catch (err) {
      console.error('Error analyzing symptoms:', err);
      setError(err.message);
      toast.error('Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDiseaseIcon = (disease) => {
    const icons = {
      'diabetes': '🩸',
      'hypertension': '💓',
      'asthma': '🫁',
      'migraine': '🧠',
      'arthritis': '🦴',
      'pneumonia': '🫁',
      'gastritis': '🍽️',
      'depression': '🧘',
      'anxiety': '😰',
      'heart attack': '💔',
      'stroke': '🧠',
      'infection': '🦠',
      'allergy': '🤧',
      'fever': '🌡️',
      'cold': '🤧'
    };
    
    const diseaseKey = Object.keys(icons).find(key => 
      disease.toLowerCase().includes(key)
    );
    
    return icons[diseaseKey] || '🔬';
  };

  const getMedicineIcon = (medicine) => {
    const icons = {
      'antibiotic': '💊',
      'painkiller': '💊',
      'insulin': '💉',
      'aspirin': '💊',
      'ibuprofen': '💊',
      'acetaminophen': '💊',
      'amoxicillin': '💊',
      'metformin': '💊',
      'lisinopril': '💊',
      'albuterol': '💨',
      'omeprazole': '💊',
      'prednisone': '💊'
    };
    
    const medicineKey = Object.keys(icons).find(key => 
      medicine.toLowerCase().includes(key)
    );
    
    return icons[medicineKey] || '💊';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getSeverityLevel = (confidence) => {
    if (confidence >= 0.8) return { level: 'High', color: 'text-red-600' };
    if (confidence >= 0.6) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-green-600' };
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-6 w-6 text-purple-600" />
            AI Diagnosis Assistant
          </CardTitle>
          <p className="text-gray-600">
            Enter patient symptoms to get AI-powered differential diagnosis and treatment recommendations.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
              Patient Symptoms & Clinical Findings
            </label>
            <Textarea
              id="symptoms"
              placeholder="Enter detailed patient presentation. For example: 'Patient presents with acute onset chest pain, radiating to left arm, associated with diaphoresis and nausea. Vital signs: BP 160/90, HR 110, RR 22. Physical exam reveals...'"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={5}
              className="w-full"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Include symptoms, duration, severity, associated findings, vital signs, and relevant physical exam findings.
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
                Analyzing Patient Data...
              </>
            ) : (
              <>
                <Activity className="mr-2 h-4 w-4" />
                Generate Differential Diagnosis
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
              AI Analysis Results
            </CardTitle>
            {results.note && (
              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                {results.note}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="diseases" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="diseases" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Differential Diagnosis
                </TabsTrigger>
                <TabsTrigger value="medicines" className="flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Treatment Options
                </TabsTrigger>
              </TabsList>

              <TabsContent value="diseases" className="space-y-4">
                <div className="space-y-3">
                  {results.diseases && results.diseases.length > 0 ? (
                    results.diseases.map((disease, index) => {
                      const severity = getSeverityLevel(disease.confidence);
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {getDiseaseIcon(disease.disease)}
                            </span>
                            <div>
                              <h3 className="font-semibold text-lg capitalize">
                                {disease.disease}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Differential #{index + 1}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              className={`${getConfidenceColor(disease.confidence)} mb-1`}
                            >
                              {disease.percentage?.toFixed(1)}% likelihood
                            </Badge>
                            <p className={`text-xs font-medium ${severity.color}`}>
                              {severity.level} Priority
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No disease predictions available.</p>
                    </div>
                  )}
                </div>

                {results.diseases && results.diseases.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Clinical Recommendations:
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Consider additional diagnostic tests to confirm top differentials</li>
                      <li>• Review patient history and risk factors</li>
                      <li>• Monitor vital signs and symptom progression</li>
                      <li>• Consider specialist consultation if indicated</li>
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="medicines" className="space-y-4">
                <div className="space-y-3">
                  {results.medicines && results.medicines.length > 0 ? (
                    results.medicines.map((medicine, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getMedicineIcon(medicine.medicine)}
                          </span>
                          <div>
                            <h3 className="font-semibold text-lg capitalize">
                              {medicine.medicine}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Treatment option #{index + 1}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            className={`${getConfidenceColor(medicine.confidence)} mb-1`}
                          >
                            {medicine.percentage?.toFixed(1)}% relevance
                          </Badge>
                          <p className="text-xs text-gray-500">
                            Confidence: {(medicine.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No treatment recommendations available.</p>
                    </div>
                  )}
                </div>

                {results.medicines && results.medicines.length > 0 && (
                  <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-semibold text-amber-900 mb-2">
                      Prescribing Considerations:
                    </h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• Verify patient allergies and contraindications</li>
                      <li>• Check for drug interactions with current medications</li>
                      <li>• Consider patient age, weight, and comorbidities</li>
                      <li>• Follow institutional prescribing guidelines</li>
                      <li>• Monitor for therapeutic response and adverse effects</li>
                    </ul>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-xs text-gray-500 border-t pt-4">
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
          </CardContent>
        </Card>
      )}

      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">Clinical Decision Support Tool:</p>
              <p>
                This AI assistant provides differential diagnosis suggestions based on symptom patterns. 
                It is intended to support, not replace, clinical judgment. Always consider the complete 
                clinical picture, patient history, and current guidelines when making diagnostic and 
                treatment decisions. Verify all recommendations against current medical literature and 
                institutional protocols.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDiagnosisAssistant;
