import { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import { CssBaseline, alpha } from '@mui/material';

const ThemeContext = createContext(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  let theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: isDarkMode ? '#90CAF9' : '#1565C0',
      },
      secondary: {
        main: isDarkMode ? '#D1C4E9' : '#7B1FA2',
      },
      background: {
        default: isDarkMode ? '#0F1115' : '#F7F7F9',
        paper: isDarkMode ? '#121417' : '#FFFFFF',
      },
      text: {
        primary: isDarkMode ? '#EDEFF2' : '#1B1B1F',
        secondary: isDarkMode ? '#A9AFB9' : '#5A5A67',
      },
      divider: isDarkMode ? '#2B2F36' : '#E5E7EB',
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 600 },
      h2: { fontWeight: 600 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      body1: { lineHeight: 1.6 },
      body2: { lineHeight: 1.6 },
    },
    components: {
      MuiIconButton: {
        styleOverrides: {
          root: {
            '&:focus-visible': {
              outline: `3px solid ${isDarkMode ? '#90CAF9' : '#1565C0'}`,
              outlineOffset: 2,
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 10,
            border: `1px solid ${isDarkMode ? '#2B2F36' : '#E5E7EB'}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            '&:focus-visible': {
              outline: `2px solid ${isDarkMode ? '#90CAF9' : '#1565C0'}`,
              outlineOffset: 2,
            },
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            '&:focus-visible': {
              outline: `2px solid ${isDarkMode ? '#90CAF9' : '#1565C0'}`,
              outlineOffset: 2,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${isDarkMode ? '#2B2F36' : '#E5E7EB'}`,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: alpha(isDarkMode ? '#90CAF9' : '#1565C0', 0.12),
            },
          },
        },
      },
      MuiTooltip: {
        defaultProps: {
          arrow: true,
        },
      },
    },
  });

  theme = responsiveFontSizes(theme);

  const value = {
    isDarkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
