/* eslint-disable no-console */
import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  useTheme,
  alpha,
} from '@mui/material';
import { Tooltip } from '@mui/material';
import {
  Send,
  Chat,
  SmartToy,
  Person,
  Refresh,
  VolumeUp,
  Translate,
  HealthAndSafety,
  Psychology,
  LocalHospital,
  Medication,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { aiAPI } from '../../services/api';

const Chatbot = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('en');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    const welcomeMessage = {
      id: Date.now(),
      text: `Hello ${user?.firstName || 'there'}! I'm your AI health assistant. How can I help you today?`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'welcome'
    };
    setMessages([welcomeMessage]);
  }, [user]);

  const quickActions = [
    {
      text: 'Book an appointment',
      icon: <LocalHospital />,
      color: '#1976d2'
    },
    {
      text: 'Check symptoms',
      icon: <HealthAndSafety />,
      color: '#2e7d32'
    },
    {
      text: 'Medicine information',
      icon: <Medication />,
      color: '#ed6c02'
    },
    {
      text: 'Health tips',
      icon: <Psychology />,
      color: '#9c27b0'
    }
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError(null);

    try {
      // Try to call the real API first, fallback to simulation if it fails
      const response = await getChatbotResponse(inputMessage);

      const botMessage = {
        id: Date.now() + 1,
        text: response.message,
        sender: 'bot',
        timestamp: new Date(),
        intent: response.intent,
        confidence: response.confidence
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError('Failed to get response from AI assistant');
      console.error('Chatbot error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getChatbotResponse = async (message) => {
    try {
      // Try to call the real API first
      const response = await aiAPI.chatbot(message);
      return {
        message: response.message || response.response || "I received your message. How can I help you further?",
        intent: response.intent || 'general',
        confidence: response.confidence || 0.8
      };
    } catch (error) {
      const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const isDemoUser = !!user && /@medreserve\.com$|@demo\./i.test(user.email || '');
      if (demoMode && isDemoUser) {
        return await simulateChatbotResponse(message);
      }
      throw error;
    }
  };

  const simulateChatbotResponse = async (message) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('appointment') || lowerMessage.includes('book')) {
      return {
        message: "I can help you book an appointment! To schedule an appointment, please visit the 'Doctors' section where you can browse available specialists and choose a convenient time slot. Would you like me to guide you there?",
        intent: 'book_appointment',
        confidence: 0.95
      };
    } else if (lowerMessage.includes('symptom') || lowerMessage.includes('pain') || lowerMessage.includes('sick')) {
      return {
        message: "I understand you're experiencing some symptoms. For a detailed symptom analysis, I recommend using our AI Symptom Checker. It can help identify potential conditions based on your symptoms. Would you like me to direct you to the symptom checker?",
        intent: 'symptom_check',
        confidence: 0.90
      };
    } else if (lowerMessage.includes('medicine') || lowerMessage.includes('medication') || lowerMessage.includes('drug')) {
      return {
        message: "I can provide information about medications. You can view your prescribed medicines in the 'Medicines' section, or if you need general medication information, I can help with that too. What specific medication information do you need?",
        intent: 'medicine_info',
        confidence: 0.88
      };
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return {
        message: `Hello ${user?.firstName || 'there'}! I'm here to help with your healthcare needs. You can ask me about booking appointments, checking symptoms, medication information, or general health questions. How can I assist you today?`,
        intent: 'greeting',
        confidence: 0.99
      };
    } else {
      return {
        message: "I'm here to help with your healthcare needs! You can ask me about:\n\n• Booking appointments with doctors\n• Symptom checking and health analysis\n• Medication information\n• General health tips\n• Emergency contacts\n\nWhat would you like to know more about?",
        intent: 'default',
        confidence: 0.75
      };
    }
  };

  const handleQuickAction = (actionText) => {
    setInputMessage(actionText);
    handleSendMessage();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2 }}>
              <SmartToy />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                MedReserve AI Assistant
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your intelligent healthcare companion
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Language options" arrow>
              <IconButton aria-label="Open language options">
                <Translate />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset conversation" arrow>
              <IconButton aria-label="Reset conversation">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={action.icon}
                    onClick={() => handleQuickAction(action.text)}
                    sx={{
                      py: 1.5,
                      borderColor: action.color,
                      color: action.color,
                      '&:hover': {
                        bgcolor: alpha(action.color, 0.1),
                        borderColor: action.color,
                      }
                    }}
                  >
                    {action.text}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Messages */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <List sx={{ p: 0 }} aria-live="polite" aria-relevant="additions" aria-label="Chat messages">
            {messages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  mb: 2
                }}
              >
                <ListItemAvatar sx={{
                  minWidth: 'auto',
                  mx: 1,
                  ...(message.sender === 'user' && { order: 1 })
                }}>
                  <Avatar sx={{
                    bgcolor: message.sender === 'user' ? theme.palette.primary.main : theme.palette.secondary.main,
                    width: 40,
                    height: 40
                  }}>
                    {message.sender === 'user' ? <Person /> : <SmartToy />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  sx={{
                    textAlign: message.sender === 'user' ? 'right' : 'left',
                    '& .MuiListItemText-primary': {
                      bgcolor: message.sender === 'user'
                        ? theme.palette.primary.main
                        : theme.palette.mode === 'dark'
                          ? theme.palette.grey[800]
                          : theme.palette.grey[100],
                      color: message.sender === 'user'
                        ? 'white'
                        : theme.palette.mode === 'dark'
                          ? theme.palette.common.white
                          : theme.palette.text.primary,
                      p: 2,
                      borderRadius: 2,
                      display: 'inline-block',
                      maxWidth: '80%',
                      whiteSpace: 'pre-wrap'
                    }
                  }}
                  primary={message.text}
                  secondary={
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                      <Typography variant="caption" color="text.secondary">
                        {message.timestamp.toLocaleTimeString()}
                      </Typography>
                      {message.intent && (
                        <Chip
                          label={message.intent}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
            {loading && (
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                    <SmartToy />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }} aria-label="Assistant is typing">
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'text.secondary', animation: 'typingBlink 1s infinite ease-in-out' }} />
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'text.secondary', animation: 'typingBlink 1s 0.2s infinite ease-in-out' }} />
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'text.secondary', animation: 'typingBlink 1s 0.4s infinite ease-in-out' }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        AI is typing
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            )}
          </List>
          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Ask me anything about your health..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              variant="outlined"
              size="small"
            />
            <Tooltip title={loading ? 'Sending...' : 'Send message'} arrow>
              <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
                '&:disabled': {
                  bgcolor: theme.palette.grey[300],
                }
              }}
              aria-label="Send message"
            >
                <Send />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Chatbot;
