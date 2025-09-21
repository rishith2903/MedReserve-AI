/**
 * Patient Chat Widget Component
 * Provides AI chatbot assistance for patients
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  X, 
  Minimize2, 
  Maximize2,
  Calendar,
  Pill,
  Phone
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PatientChatWidget = ({ isOpen, onToggle, userToken }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          type: 'bot',
          content: `Hello! 👋 I'm your MedReserve AI assistant. I can help you with:

🩺 **Book appointments** with doctors
📅 **View your upcoming appointments**
💊 **Check your prescriptions**
📊 **View your medical reports**
👨‍⚕️ **Find doctor information**

What would you like to do today?`,
          timestamp: new Date().toISOString(),
          actions: [
            { type: 'book_appointment', label: 'Book Appointment', icon: Calendar },
            { type: 'view_appointments', label: 'My Appointments', icon: Calendar },
            { type: 'view_prescriptions', label: 'My Prescriptions', icon: Pill },
            { type: 'find_doctors', label: 'Find Doctors', icon: User }
          ]
        }
      ]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

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
      const response = await fetch('/api/chat/patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          message: messageText,
          conversation_id: `patient_${Date.now()}`
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
      if (data.type === 'emergency') {
        toast.error('Emergency detected! Please seek immediate medical attention.');
      } else if (data.type === 'appointments_list' || data.type === 'prescriptions_list') {
        toast.success('Information retrieved successfully');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment or contact support if the issue persists.",
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
      'book_appointment': 'I want to book an appointment',
      'view_appointments': 'Show me my upcoming appointments',
      'view_prescriptions': 'Show me my current prescriptions',
      'view_reports': 'Show me my medical reports',
      'find_doctors': 'Help me find a doctor',
      'emergency': 'This is an emergency, I need immediate help'
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
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  const getMessageIcon = (type) => {
    return type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />;
  };

  const getMessageBgColor = (message) => {
    if (message.type === 'user') return 'bg-blue-500 text-white';
    if (message.isError) return 'bg-red-50 border-red-200';
    if (message.messageType === 'emergency') return 'bg-red-100 border-red-300';
    return 'bg-gray-50 border-gray-200';
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 w-96 shadow-xl z-50 transition-all duration-300 ${
      isMinimized ? 'h-16' : 'h-[600px]'
    }`}>
      <CardHeader className="flex flex-row items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5" />
          MedReserve AI Assistant
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 text-white hover:bg-blue-700"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-white hover:bg-blue-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col h-[calc(600px-80px)] p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start gap-2 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
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
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">Thinking...</span>
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
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionClick({ type: 'emergency', label: 'Emergency' })}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Phone className="h-3 w-3 mr-1" />
                Emergency
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionClick({ type: 'book_appointment', label: 'Book' })}
              >
                <Calendar className="h-3 w-3 mr-1" />
                Book
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionClick({ type: 'view_prescriptions', label: 'Meds' })}
              >
                <Pill className="h-3 w-3 mr-1" />
                Meds
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default PatientChatWidget;
