/* eslint-disable react/prop-types */
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Container,
} from '@mui/material';
import {
  Construction,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PlaceholderPage = ({ title, description, icon: Icon = Construction, actions = [] }) => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
        }}
      >
        <Card sx={{ p: 4, maxWidth: 500, width: '100%' }}>
          <CardContent>
            <Icon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} aria-hidden />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {description || 'This page is currently under development. Please check back later.'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              {actions.map((action, idx) => (
                <Button
                  key={idx}
                  variant={action.variant || 'outlined'}
                  startIcon={action.icon}
                  onClick={action.onClick}
                  aria-label={action.ariaLabel || action.label}
                >
                  {action.label}
                </Button>
              ))}
              <Button
                variant="contained"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/dashboard')}
                sx={{ mt: 1 }}
              >
                Back to Dashboard
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default PlaceholderPage;
