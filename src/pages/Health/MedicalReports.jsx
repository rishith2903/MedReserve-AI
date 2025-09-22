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
  Skeleton,
  Stack,
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
  AttachFile,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { medicalReportsAPI } from '../../services/api';
import realTimeDataService from '../../services/realTimeDataService';
import useRealtimePoll from '../../hooks/useRealtimePoll';

const REPORT_TYPES = [
  'OTHER',
  'BLOOD_TEST',
  'URINE_TEST',
  'X_RAY',
  'CT_SCAN',
  'MRI',
  'ULTRASOUND',
  'ECG',
  'ECHO',
  'PATHOLOGY',
  'RADIOLOGY',
  'PRESCRIPTION',
  'DISCHARGE_SUMMARY',
];

const MedicalReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  // Upload form state
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', reportType: 'OTHER' });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

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

  useRealtimePoll(async () => {
    await fetchReports();
  }, 60000, []);

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
    setUploadError(null);
    setUploadSuccess(null);
    setUploadForm({ title: '', description: '', reportType: 'OTHER' });
    setUploadFile(null);
    setUploadDialogOpen(true);
  };

  const handleUploadSubmit = async () => {
    try {
      setUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      if (!uploadForm.title.trim()) {
        setUploadError('Title is required');
        setUploading(false);
        return;
      }
      if (!uploadFile) {
        setUploadError('Please select a file to upload');
        setUploading(false);
        return;
      }

      const form = new FormData();
      form.append('file', uploadFile);
      const reportMeta = {
        title: uploadForm.title.trim(),
        description: uploadForm.description?.trim() || '',
        reportType: uploadForm.reportType || 'OTHER',
        shareWithDoctor: false,
      };
      form.append('report', new Blob([JSON.stringify(reportMeta)], { type: 'application/json' }));

      await medicalReportsAPI.upload(form);
      setUploadSuccess('Report uploaded successfully');
      setUploadDialogOpen(false);
      await fetchReports();
    } catch (e) {
      const msg = e?.response?.data?.message || 'Upload failed. Please try again.';
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (report) => {
    try {
      const { blob, filename } = await medicalReportsAPI.download(report.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || report.title || 'report';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download report');
    }
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await medicalReportsAPI.delete(reportId);
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
      <Box>
        <Box sx={{ mb: 4 }}>
          <Skeleton width={260} height={40} sx={{ mb: 1 }} />
          <Skeleton width={420} height={24} />
        </Box>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} md={6} lg={4} key={i}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Skeleton width="70%" height={24} />
                      <Skeleton width="40%" height={20} />
                    </Box>
                  </Box>
                  <Skeleton width="50%" height={20} sx={{ mb: 1 }} />
                  <Skeleton width="30%" height={20} />
                  <Skeleton width="60%" height={16} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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

      {uploadSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {uploadSuccess}
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
                    aria-label={`Download ${report.title}`}
                    >
                      <Download />
                    </IconButton>
                    <IconButton
                      size="small"
                    title="View"
                    aria-label={`View ${report.title}`}
                    >
                      <Visibility />
                    </IconButton>
                  </Box>
                <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(report.id)}
                  title="Delete"
                  aria-label={`Delete ${report.title}`}
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
      <Dialog open={uploadDialogOpen} onClose={() => !uploading && setUploadDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Upload Medical Report</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {uploadError && (
              <Alert severity="error">{uploadError}</Alert>
            )}
            <TextField
              label="Title"
              value={uploadForm.title}
              onChange={(e) => setUploadForm((f) => ({ ...f, title: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={uploadForm.description}
              onChange={(e) => setUploadForm((f) => ({ ...f, description: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                label="Report Type"
                value={uploadForm.reportType}
                onChange={(e) => setUploadForm((f) => ({ ...f, reportType: e.target.value }))}
              >
                {REPORT_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t.replaceAll('_', ' ')}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box>
              <Button variant="outlined" component="label" startIcon={<AttachFile />} disabled={uploading}>
                {uploadFile ? 'Change File' : 'Choose File'}
                <input
                  hidden
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </Button>
              {uploadFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {uploadFile.name}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={uploading}>Cancel</Button>
          <Button onClick={handleUploadSubmit} variant="contained" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MedicalReports;
