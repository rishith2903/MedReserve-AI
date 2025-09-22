/**
 * API Status Dashboard Component (MUI version)
 * Shows real-time status of all backend integrations
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  Grid,
  Paper,
  LinearProgress,
  Alert,
  Skeleton,
  Stack,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Refresh,
  Wifi,
  WifiOff,
  Storage,
  Dns,
  Chat,
  Insights,
  AccessTime,
} from '@mui/icons-material';
import { apiTester } from '../../utils/apiTester';
import useRealtimePoll from '../../hooks/useRealtimePoll';

const APIStatusDashboard = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.apiTestResults) {
      setTestResults(window.apiTestResults);
      setLastUpdate(new Date());
    }
  }, []);

  // Poll tests every 2 minutes when not already running
  useRealtimePoll(async () => {
    if (!isRunning) {
      await runTests();
    }
  }, 120000, [isRunning]);

  const runTests = async () => {
    setIsRunning(true);
    setError(null);
    try {
      await apiTester.runAllTests();
      setTestResults(window.apiTestResults);
      setLastUpdate(new Date());
    } catch (e) {
      console.error('Failed to run API tests:', e);
      setError('Failed to run API tests');
    } finally {
      setIsRunning(false);
    }
  };

  const getOverallStatus = () => {
    if (!testResults) return 'pending';
    const { summary } = testResults;
    if (!summary) return 'pending';
    if (summary.passedRequired === summary.required) return 'operational';
    if (summary.passedRequired > 0) return 'degraded';
    return 'outage';
  };

  const overallStatusLabel = () => {
    const s = getOverallStatus();
    if (s === 'operational') return 'Operational';
    if (s === 'degraded') return 'Degraded';
    if (s === 'outage') return 'Outage';
    return 'Pending';
  };

  const statusChipColor = (status) => {
    switch (status) {
      case 'passed':
      case 'operational':
        return 'success';
      case 'partial':
      case 'degraded':
        return 'warning';
      case 'failed':
      case 'outage':
        return 'error';
      default:
        return 'default';
    }
  };

  const categoryIcon = (category) => {
    const map = {
      authentication: <Dns fontSize="small" />,
      dashboard: <Insights fontSize="small" />,
      doctors: <Dns fontSize="small" />,
      appointments: <Storage fontSize="small" />,
      prescriptions: <Storage fontSize="small" />,
      reports: <Storage fontSize="small" />,
      chatbot: <Chat fontSize="small" />,
    };
    return map[category] || <Dns fontSize="small" />;
  };

  const uptimePercent = () => {
    if (!testResults?.summary) return 0;
    return Math.round((testResults.summary.passedRequired / testResults.summary.required) * 100);
  };

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          title={
            <Stack direction="row" spacing={1} alignItems="center">
              {getOverallStatus() === 'operational' ? <Wifi color="success" /> : <WifiOff color={getOverallStatus()==='outage' ? 'error' : 'warning'} />}
              <Typography variant="h6">MedReserve AI System Status</Typography>
            </Stack>
          }
          action={
            <Button onClick={runTests} disabled={isRunning} variant="outlined" size="small" startIcon={<Refresh />} aria-label="Run system tests">
              {isRunning ? 'Testing…' : 'Run Tests'}
            </Button>
          }
        />
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                {overallStatusLabel()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {testResults ? `${testResults.summary.passedRequired}/${testResults.summary.required} critical services operational` : 'Click &quot;Run Tests&quot; to check system status'}
              </Typography>
            </Box>
            {testResults && (
              <Box textAlign="right">
                <Typography variant="h5" fontWeight={700}>{uptimePercent()}%</Typography>
                <Typography variant="caption" color="text.secondary">Uptime</Typography>
              </Box>
            )}
          </Stack>
          {testResults ? (
            <LinearProgress variant="determinate" value={uptimePercent()} sx={{ height: 6, borderRadius: 3 }} />
          ) : (
            <Skeleton variant="rectangular" height={6} />
          )}
          {lastUpdate && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Last updated: {lastUpdate.toLocaleString()}
            </Typography>
          )}
        </CardContent>
      </Card>

      {testResults && (
        <Grid container spacing={2}>
          {Object.entries(testResults.details).map(([category, result]) => (
            <Grid item xs={12} md={6} lg={4} key={category}>
              <Paper sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {categoryIcon(category)}
                    <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                      {category.replace('_', ' ')}
                    </Typography>
                  </Stack>
                  <Chip size="small" label={(result.status || 'pending').toUpperCase()} color={statusChipColor(result.status)} aria-label={`Status ${result.status || 'pending'}`} />
                </Stack>

                <Stack spacing={0.75}>
                  {result.tests?.map((test, idx) => (
                    <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        {test.passed ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />}
                        <Typography variant="caption" color={test.passed ? 'success.main' : 'error.main'}>{test.name}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <AccessTime fontSize="inherit" />
                        <Typography variant="caption" color="text.secondary">{test.responseTime}ms</Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>

                {result.error && (
                  <Alert severity="error" sx={{ mt: 1 }} variant="outlined">{result.error}</Alert>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Card>
        <CardHeader title="Integration Status" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Backend Services</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Spring Boot API</Typography>
                  <Chip variant="outlined" color={import.meta.env.VITE_API_BASE_URL ? 'success' : 'default'} size="small" label={import.meta.env.VITE_API_BASE_URL ? 'Configured' : 'Not Set'} />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">ML Service</Typography>
                  <Chip variant="outlined" color={import.meta.env.VITE_ML_SERVICE_URL ? 'success' : 'default'} size="small" label={import.meta.env.VITE_ML_SERVICE_URL ? 'Configured' : 'Not Set'} />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Chatbot Service</Typography>
                  <Chip variant="outlined" color={import.meta.env.VITE_CHATBOT_SERVICE_URL ? 'success' : 'default'} size="small" label={import.meta.env.VITE_CHATBOT_SERVICE_URL ? 'Configured' : 'Not Set'} />
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Real-time Features</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">WebSocket</Typography>
                  <Chip variant="outlined" color={import.meta.env.VITE_WEBSOCKET_URL ? 'success' : 'default'} size="small" label={import.meta.env.VITE_WEBSOCKET_URL ? 'Configured' : 'Not Set'} />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Auto-refresh</Typography>
                  <Chip variant="outlined" color={import.meta.env.VITE_ENABLE_REAL_TIME_UPDATES === 'true' ? 'success' : 'default'} size="small" label={import.meta.env.VITE_ENABLE_REAL_TIME_UPDATES === 'true' ? 'Enabled' : 'Disabled'} />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Fallback Data</Typography>
                  <Chip variant="outlined" color="info" size="small" label="Active" />
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Testing Instructions" />
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="body2"><strong>Automatic Testing:</strong> Add <code>?test-api</code> to the URL to run tests automatically.</Typography>
            <Typography variant="body2"><strong>Manual Testing:</strong> Click &quot;Run Tests&quot; to check all API endpoints.</Typography>
            <Typography variant="body2"><strong>Fallback Mode:</strong> When APIs are unavailable, the app uses enhanced demo data.</Typography>
            <Typography variant="body2"><strong>Real-time Updates:</strong> Data refreshes automatically every 60 seconds when APIs are available.</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default APIStatusDashboard;
