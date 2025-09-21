import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Description,
  CloudUpload,
  Download,
  Delete,
  Visibility,
  Add,
  FilterList,
  Search,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { medicalReportsAPI } from '../../services/api';
import realTimeDataService from '../../services/realTimeDataService';

const MedicalReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  // Mock data for demonstration
  const mockReports = [
    {
      id: 1,
      title: 'Blood Test Results',
      type: 'Lab Report',
      date: '2024-01-15',
      doctor: 'Dr. Smith',
      status: 'Normal',
      description: 'Complete blood count and lipid profile',
      fileUrl: '#',
    },
    {
      id: 2,
      title: 'X-Ray Chest',
      type: 'Imaging',
      date: '2024-01-10',
      doctor: 'Dr. Johnson',
      status: 'Reviewed',
      description: 'Chest X-ray for routine checkup',
      fileUrl: '#',
    },
    {
      id: 3,
      title: 'ECG Report',
      type: 'Cardiac',
      date: '2024-01-05',
      doctor: 'Dr. Williams',
      status: 'Normal',
      description: 'Electrocardiogram test results',
      fileUrl: '#',
    },
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching medical reports using real-time data service...');
      const reportsData = await realTimeDataService.fetchMedicalReports();

      setReports(reportsData);
      console.log('✅ Successfully loaded medical reports:', reportsData.length);

      if (reportsData.length <= 2) {
        setError('Showing demo medical reports. Upload reports to see them here.');
      }

    } catch (err) {
      console.error('❌ Error fetching medical reports:', err);
      setError('Failed to fetch medical reports. Showing demo data.');
      setReports(mockReports); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = () => {
    setUploadDialogOpen(true);
  };

  const handleDownload = (report) => {
    // Implement download logic
    console.log('Downloading report:', report.title);
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        // await medicalReportsAPI.delete(reportId);
        setReports(reports.filter(report => report.id !== reportId));
      } catch (err) {
        setError('Failed to delete report');
      }
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterType || report.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const reportTypes = [...new Set(reports.map(report => report.type))];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Medical Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Access and manage your medical reports and test results
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={handleUpload}
        >
          Upload Report
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Search reports by title or doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={filterType}
              label="Filter by Type"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              {reportTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Reports Grid */}
      <Grid container spacing={3}>
        {filteredReports.map((report) => (
          <Grid item xs={12} md={6} lg={4} key={report.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <Description />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {report.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {report.doctor}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={report.type}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={report.status}
                    size="small"
                    color={report.status === 'Normal' ? 'success' : 'info'}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {report.description}
                </Typography>

                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Date: {new Date(report.date).toLocaleDateString()}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleDownload(report)}
                      title="Download"
                    >
                      <Download />
                    </IconButton>
                    <IconButton
                      size="small"
                      title="View"
                    >
                      <Visibility />
                    </IconButton>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(report.id)}
                    title="Delete"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredReports.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Description sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No medical reports found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || filterType ? 'Try adjusting your search or filter' : 'Upload your first medical report to get started'}
          </Typography>
        </Box>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Medical Report</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload your medical reports, lab results, or imaging studies.
          </Typography>
          <TextField
            fullWidth
            label="Report Title"
            margin="normal"
            placeholder="e.g., Blood Test Results"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Report Type</InputLabel>
            <Select label="Report Type">
              <MenuItem value="Lab Report">Lab Report</MenuItem>
              <MenuItem value="Imaging">Imaging</MenuItem>
              <MenuItem value="Cardiac">Cardiac</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            rows={3}
            placeholder="Brief description of the report"
          />
          <Box sx={{ mt: 2, p: 3, border: '2px dashed', borderColor: 'grey.300', borderRadius: 1, textAlign: 'center' }}>
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Drag and drop files here or click to browse
            </Typography>
            <Button variant="outlined" sx={{ mt: 1 }}>
              Choose Files
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Upload</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MedicalReports;
