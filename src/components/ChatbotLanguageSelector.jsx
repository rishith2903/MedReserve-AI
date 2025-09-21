/* eslint-disable no-console */
import { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Language as LanguageIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

/**
 * Language Selector Component for Dialogflow Chatbot
 * Allows users to switch between English, Hindi, and Telugu
 */
const ChatbotLanguageSelector = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isVisible, setIsVisible] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिंदी' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳', nativeName: 'తెలుగు' }
  ];

  useEffect(() => {
    // Check if Dialogflow messenger is loaded
    const checkDialogflowMessenger = () => {
      const messenger = document.querySelector('df-messenger');
      if (messenger) {
        setIsVisible(true);
        // Set initial language
        messenger.setAttribute('language-code', selectedLanguage);
      } else {
        // Retry after a short delay
        setTimeout(checkDialogflowMessenger, 1000);
      }
    };

    checkDialogflowMessenger();
  }, [selectedLanguage]);

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setSelectedLanguage(newLanguage);

    // Update Dialogflow messenger language
    const messenger = document.querySelector('df-messenger');
    if (messenger) {
      messenger.setAttribute('language-code', newLanguage);
      
      // Optional: Send a message to reset the conversation in the new language
      // Show language change notification
      console.log(`🌐 Chatbot language changed to: ${languages.find(l => l.code === newLanguage)?.name}`);
    }

    // Store preference in localStorage
    localStorage.setItem('medreserve-chatbot-language', newLanguage);
  };

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('medreserve-chatbot-language');
    if (savedLanguage && languages.find(l => l.code === savedLanguage)) {
      setSelectedLanguage(savedLanguage);
    }
  }, []);

  if (!isVisible) {
    return null; // Don't render until Dialogflow messenger is loaded
  }

  const currentLanguage = languages.find(l => l.code === selectedLanguage);

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 100,
        right: 20,
        p: 2,
        minWidth: 200,
        zIndex: 999,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        border: '1px solid rgba(25, 118, 210, 0.2)'
      }}
    >
      <Box display="flex" alignItems="center" mb={1}>
        <LanguageIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="subtitle2" color="primary" fontWeight="bold">
          Chatbot Language
        </Typography>
      </Box>

      <FormControl fullWidth size="small">
        <InputLabel id="chatbot-language-label">Select Language</InputLabel>
        <Select
          labelId="chatbot-language-label"
          value={selectedLanguage}
          label="Select Language"
          onChange={handleLanguageChange}
          sx={{ mb: 1 }}
        >
          {languages.map((language) => (
            <MenuItem key={language.code} value={language.code}>
              <Box display="flex" alignItems="center" gap={1}>
                <span style={{ fontSize: '1.2em' }}>{language.flag}</span>
                <Box>
                  <Typography variant="body2">{language.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {language.nativeName}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Chip
          icon={<ChatIcon />}
          label={`Active: ${currentLanguage?.nativeName}`}
          size="small"
          color="primary"
          variant="outlined"
        />
        
        <Tooltip title="Language settings saved automatically">
          <IconButton size="small" color="primary">
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        💬 Chat with our AI assistant in your preferred language
      </Typography>
    </Paper>
  );
};

/**
 * Utility function to programmatically change chatbot language
 */
export const changeChatbotLanguage = (languageCode) => {
  const messenger = document.querySelector('df-messenger');
  if (messenger) {
    messenger.setAttribute('language-code', languageCode);
    localStorage.setItem('medreserve-chatbot-language', languageCode);
    return true;
  }
  return false;
};

/**
 * Utility function to get current chatbot language
 */
export const getCurrentChatbotLanguage = () => {
  const messenger = document.querySelector('df-messenger');
  if (messenger) {
    return messenger.getAttribute('language-code') || 'en';
  }
  return localStorage.getItem('medreserve-chatbot-language') || 'en';
};

/**
 * Hook for chatbot language management
 */
export const useChatbotLanguage = () => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('medreserve-chatbot-language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage) => {
    if (changeChatbotLanguage(newLanguage)) {
      setLanguage(newLanguage);
    }
  };

  return { language, changeLanguage };
};

export default ChatbotLanguageSelector;
