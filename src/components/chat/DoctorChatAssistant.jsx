/**
 * Doctor Chat Assistant Component
 * Provides AI assistance for doctors with clinical workflow support
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
/* eslint-disable react/prop-types */
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Stethoscope, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  X, 
  Minimize2, 
  Maximize2,
  Calendar,
  Users,
  Pill,
  FileText,
  AlertTriangle,
  Clock,
  Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DoctorChatAssistant = ({ isOpen, onToggle, userToken, doctorInfo }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('assistant');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initial welcome message for doctor
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          type: 'bot',
          content: `Good day, Dr. ${doctorInfo?.name || 'Doctor'}! 👨‍⚕️

I'm your MedReserve AI clinical assistant. I can help you with:

📅 **Appointment Management**
- View today's schedule and upcoming appointments
- Manage patient appointments

👥 **Patient Care**
- Review patient lists and medical histories
- Access treatment records

💊 **Clinical Documentation**
- Add prescriptions via natural language
- Record diagnoses and treatment plans

🚨 **Clinical Support**
- Emergency patient alerts
- Treatment recommendations

What would you like to do today?`,
          timestamp: new Date().toISOString(),
          actions: [
            { type: 'view_appointments', label: 'Today\'s Schedule', icon: Calendar },
            { type: 'view_patients', label: 'My Patients', icon: Users },
            { type: 'emergency_alerts', label: 'Emergency Alerts', icon: AlertTriangle },
            { type: 'add_prescription', label: 'Add Prescription', icon: Pill }
          ]
        }
      ]);
    }
  }, [isOpen, messages.length, doctorInfo]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && activeTab === 'assistant') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized, activeTab]);

  const sendMessage = async (messageText = inputMessage, isAction = false) => {
    if (!messageText.trim() && !isAction) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          message: messageText,
          conversation_id: `doctor_${doctorInfo?.id}_${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();

      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response,
        timestamp: data.timestamp,
        actions: data.actions || [],
        data: data.data,
        messageType: data.type
      };

      setMessages(prev => [...prev, botMessage]);

      // Handle special message types
      if (data.type === 'emergency_alerts') {
        toast.error('Emergency patients require attention!');
      } else if (data.type === 'prescription_added') {
        toast.success('Prescription added successfully');
      } else if (data.type === 'appointments_schedule') {
        toast.success('Schedule retrieved successfully');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm experiencing technical difficulties. Please try again or use the manual system if urgent.",
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action) => {
    const actionMessages = {
      'view_appointments': 'Show me today\'s appointment schedule',
      'view_patients': 'Show me my patient list',
      'emergency_alerts': 'Check for emergency patients',
      'add_prescription': 'I want to add a prescription',
      'add_diagnosis': 'I want to record a diagnosis',
      'patient_history': 'Show patient medical history',
      'schedule_management': 'Help me manage my schedule'
    };

    const message = actionMessages[action.type] || action.label;
    sendMessage(message, true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content) => {
    // Enhanced formatting for clinical content
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/📅|🩺|💊|⚠️|✅|❌|🔥|📊|👥|🚨/g, '<span class="text-lg">$&</span>')
      .replace(/\n/g, '<br />');
  };

  const getMessageIcon = (type) => {
    return type === 'user' ? <User className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />;
  };

  const getMessageBgColor = (message) => {
    if (message.type === 'user') return 'bg-blue-500 text-white';
    if (message.isError) return 'bg-red-50 border-red-200';
    if (message.messageType === 'emergency_alerts') return 'bg-red-100 border-red-300';
    if (message.messageType === 'prescription_added') return 'bg-green-50 border-green-200';
    return 'bg-gray-50 border-gray-200';
  };

  const QuickActions = () => (
    <div className="grid grid-cols-2 gap-2 p-4 border-t">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleActionClick({ type: 'view_appointments' })}
        className="flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        Today&apos;s Schedule
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleActionClick({ type: 'emergency_alerts' })}
        className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
      >
        <AlertTriangle className="h-4 w-4" />
        Emergencies
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleActionClick({ type: 'view_patients' })}
        className="flex items-center gap-2"
      >
        <Users className="h-4 w-4" />
        My Patients
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleActionClick({ type: 'add_prescription' })}
        className="flex items-center gap-2"
      >
        <Pill className="h-4 w-4" />
        Add Prescription
      </Button>
    </div>
  );

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 z-50"
        size="icon"
      >
        <Stethoscope className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 w-[450px] shadow-xl z-50 transition-all duration-300 ${
      isMinimized ? 'h-16' : 'h-[700px]'
    }`}>
      <CardHeader className="flex flex-row items-center justify-between p-4 bg-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Stethoscope className="h-5 w-5" />
          Clinical AI Assistant
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-purple-700 text-white">
            Dr. {doctorInfo?.name || 'Doctor'}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 text-white hover:bg-purple-700"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-white hover:bg-purple-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col h-[calc(700px-80px)] p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-2 m-2">
              <TabsTrigger value="assistant" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger value="quick" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Quick Actions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assistant" className="flex flex-col flex-1 m-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`flex items-start gap-2 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-purple-100 text-purple-600'
                          }`}>
                            {getMessageIcon(message.type)}
                          </div>
                          
                          <div className={`rounded-lg p-3 border ${getMessageBgColor(message)} ${
                            message.type === 'user' ? 'rounded-br-none' : 'rounded-bl-none'
                          }`}>
                            <div 
                              className="text-sm whitespace-pre-wrap"
                              dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                            />
                            
                            {/* Action Buttons */}
                            {message.actions && message.actions.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {message.actions.map((action, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleActionClick(action)}
                                    className="text-xs"
                                  >
                                    {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-500 mt-2">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <Stethoscope className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-gray-600">Processing...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about patients, add prescriptions, check schedule..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={isLoading || !inputMessage.trim()}
                    size="icon"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quick" className="flex flex-col flex-1 m-0">
              <QuickActions />
              
              <div className="flex-1 p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Card className="p-3">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Quick Prescription Templates
                      </h4>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => sendMessage('Prescribe paracetamol 500mg twice daily for 5 days')}
                        >
                          Paracetamol 500mg - Pain relief
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => sendMessage('Prescribe amoxicillin 250mg three times daily for 7 days')}
                        >
                          Amoxicillin 250mg - Antibiotic
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => sendMessage('Prescribe omeprazole 20mg once daily for 14 days')}
                        >
                          Omeprazole 20mg - Acid reducer
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-3">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Common Queries
                      </h4>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => sendMessage('Show me patients with diabetes')}
                        >
                          Diabetic patients
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => sendMessage('Who has appointments this week?')}
                        >
                          This week&apos;s appointments
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => sendMessage('Show overdue follow-ups')}
                        >
                          Overdue follow-ups
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
};

export default DoctorChatAssistant;
