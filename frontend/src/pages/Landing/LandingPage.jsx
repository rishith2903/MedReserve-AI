import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    IconButton,
    useTheme,
    alpha,
} from '@mui/material';
import {
    LocalHospital,
    Psychology,
    CalendarMonth,
    Chat,
    Security,
    Speed,
    ArrowForward,
    KeyboardArrowDown,
    GitHub,
    LinkedIn,
    HealthAndSafety,
    MedicalServices,
    Verified,
    Star,
} from '@mui/icons-material';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: <Psychology sx={{ fontSize: 48 }} />,
            title: 'AI Symptom Checker',
            description: 'Advanced ML-powered analysis to recommend the right medical specialist based on your symptoms.',
            color: '#6366f1',
        },
        {
            icon: <Chat sx={{ fontSize: 48 }} />,
            title: '24/7 Healthcare Chatbot',
            description: 'Intelligent conversational AI for instant medical guidance, appointment booking, and health queries.',
            color: '#8b5cf6',
        },
        {
            icon: <CalendarMonth sx={{ fontSize: 48 }} />,
            title: 'Smart Appointments',
            description: 'Seamless booking with real-time doctor availability, reminders, and schedule management.',
            color: '#06b6d4',
        },
        {
            icon: <MedicalServices sx={{ fontSize: 48 }} />,
            title: 'Digital Prescriptions',
            description: 'Secure electronic prescriptions with medication tracking and refill notifications.',
            color: '#10b981',
        },
        {
            icon: <HealthAndSafety sx={{ fontSize: 48 }} />,
            title: 'Health Records',
            description: 'Centralized EHR management with secure access to your complete medical history.',
            color: '#f59e0b',
        },
        {
            icon: <Security sx={{ fontSize: 48 }} />,
            title: 'HIPAA Compliant',
            description: 'Enterprise-grade security with end-to-end encryption protecting your sensitive health data.',
            color: '#ef4444',
        },
    ];

    const stats = [
        { value: '10K+', label: 'Active Patients' },
        { value: '500+', label: 'Verified Doctors' },
        { value: '50K+', label: 'Appointments Booked' },
        { value: '99.9%', label: 'Uptime' },
    ];

    const testimonials = [
        {
            name: 'Dr. Sarah Johnson',
            role: 'Cardiologist',
            avatar: 'S',
            content: 'MedReserve AI has transformed how I manage patient appointments. The AI chatbot handles routine queries, letting me focus on patient care.',
            rating: 5,
        },
        {
            name: 'Rahul Sharma',
            role: 'Patient',
            avatar: 'R',
            content: 'The symptom checker accurately recommended a neurologist for my migraines. Got an appointment within 24 hours!',
            rating: 5,
        },
        {
            name: 'Dr. Michael Chen',
            role: 'General Physician',
            avatar: 'M',
            content: 'Best healthcare platform I\'ve used. The prescription management and patient history features are incredibly intuitive.',
            rating: 5,
        },
    ];

    return (
        <Box className="landing-page">
            {/* Navbar */}
            <Box
                component="nav"
                className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}
            >
                <Container maxWidth="lg">
                    <Box className="navbar-content">
                        <Box className="logo">
                            <LocalHospital sx={{ fontSize: 32, color: '#6366f1' }} />
                            <Typography variant="h5" fontWeight={700}>
                                MedReserve<span style={{ color: '#6366f1' }}>AI</span>
                            </Typography>
                        </Box>
                        <Box className="nav-actions">
                            <Button
                                variant="text"
                                onClick={() => navigate('/login')}
                                sx={{ color: 'text.primary', fontWeight: 600 }}
                            >
                                Login
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/signup')}
                                className="cta-button"
                                endIcon={<ArrowForward />}
                            >
                                Get Started
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Hero Section */}
            <Box className="hero-section">
                <div className="hero-bg-gradient" />
                <div className="hero-grid-pattern" />
                <Container maxWidth="lg" className="hero-content">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Chip
                                label="🚀 AI-Powered Healthcare Platform"
                                className="hero-chip"
                                sx={{ mb: 3 }}
                            />
                            <Typography variant="h1" className="hero-title">
                                Your Health, <br />
                                <span className="gradient-text">Intelligently Managed</span>
                            </Typography>
                            <Typography variant="h6" className="hero-subtitle">
                                Experience the future of healthcare with AI-driven symptom analysis,
                                smart appointment scheduling, and 24/7 virtual assistance—all in one platform.
                            </Typography>
                            <Box className="hero-buttons">
                                <Button
                                    variant="contained"
                                    size="large"
                                    className="cta-button primary"
                                    onClick={() => navigate('/signup')}
                                    endIcon={<ArrowForward />}
                                >
                                    Start Free Trial
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    className="cta-button secondary"
                                    onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                                >
                                    Learn More
                                </Button>
                            </Box>
                            <Box className="hero-trust-badges">
                                <Verified sx={{ color: '#10b981' }} />
                                <Typography variant="body2" color="text.secondary">
                                    Trusted by 500+ Healthcare Providers
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box className="hero-illustration">
                                <div className="floating-card card-1">
                                    <Psychology sx={{ color: '#6366f1', fontSize: 28 }} />
                                    <Typography variant="body2" fontWeight={600}>AI Analysis</Typography>
                                    <Typography variant="caption" color="text.secondary">98% Accuracy</Typography>
                                </div>
                                <div className="floating-card card-2">
                                    <CalendarMonth sx={{ color: '#06b6d4', fontSize: 28 }} />
                                    <Typography variant="body2" fontWeight={600}>Quick Booking</Typography>
                                    <Typography variant="caption" color="text.secondary">2 min average</Typography>
                                </div>
                                <div className="floating-card card-3">
                                    <Chat sx={{ color: '#8b5cf6', fontSize: 28 }} />
                                    <Typography variant="body2" fontWeight={600}>24/7 Support</Typography>
                                    <Typography variant="caption" color="text.secondary">Always Online</Typography>
                                </div>
                                <div className="hero-main-visual">
                                    <LocalHospital sx={{ fontSize: 120, color: 'rgba(99, 102, 241, 0.15)' }} />
                                </div>
                            </Box>
                        </Grid>
                    </Grid>
                    <IconButton
                        className="scroll-indicator"
                        onClick={() => document.getElementById('stats').scrollIntoView({ behavior: 'smooth' })}
                    >
                        <KeyboardArrowDown />
                    </IconButton>
                </Container>
            </Box>

            {/* Stats Section */}
            <Box id="stats" className="stats-section">
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        {stats.map((stat, index) => (
                            <Grid item xs={6} md={3} key={index}>
                                <Box className="stat-card">
                                    <Typography variant="h2" className="stat-value">
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {stat.label}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Features Section */}
            <Box id="features" className="features-section">
                <Container maxWidth="lg">
                    <Box className="section-header">
                        <Chip label="Features" className="section-chip" />
                        <Typography variant="h2" className="section-title">
                            Everything You Need for <span className="gradient-text">Better Healthcare</span>
                        </Typography>
                        <Typography variant="body1" className="section-subtitle">
                            Comprehensive tools designed to streamline your healthcare experience
                        </Typography>
                    </Box>
                    <Grid container spacing={4}>
                        {features.map((feature, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card className="feature-card" elevation={0}>
                                    <CardContent>
                                        <Box
                                            className="feature-icon"
                                            sx={{ backgroundColor: alpha(feature.color, 0.1), color: feature.color }}
                                        >
                                            {feature.icon}
                                        </Box>
                                        <Typography variant="h6" fontWeight={700} gutterBottom>
                                            {feature.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Testimonials Section */}
            <Box className="testimonials-section">
                <Container maxWidth="lg">
                    <Box className="section-header">
                        <Chip label="Testimonials" className="section-chip" />
                        <Typography variant="h2" className="section-title">
                            Loved by <span className="gradient-text">Healthcare Professionals</span>
                        </Typography>
                    </Box>
                    <Grid container spacing={4}>
                        {testimonials.map((testimonial, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <Card className="testimonial-card" elevation={0}>
                                    <CardContent>
                                        <Box className="testimonial-rating">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <Star key={i} sx={{ color: '#f59e0b', fontSize: 20 }} />
                                            ))}
                                        </Box>
                                        <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                                            "{testimonial.content}"
                                        </Typography>
                                        <Box className="testimonial-author">
                                            <Avatar sx={{ bgcolor: '#6366f1' }}>{testimonial.avatar}</Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700}>
                                                    {testimonial.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {testimonial.role}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box className="cta-section">
                <Container maxWidth="md">
                    <Box className="cta-content">
                        <Typography variant="h3" fontWeight={700} gutterBottom>
                            Ready to Transform Your Healthcare Experience?
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                            Join thousands of patients and doctors already using MedReserve AI
                        </Typography>
                        <Box className="cta-buttons">
                            <Button
                                variant="contained"
                                size="large"
                                className="cta-button-white"
                                onClick={() => navigate('/signup')}
                                endIcon={<ArrowForward />}
                            >
                                Get Started Free
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                className="cta-button-outline"
                                onClick={() => navigate('/login')}
                            >
                                Sign In
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Footer */}
            <Box component="footer" className="landing-footer">
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Box className="footer-brand">
                                <LocalHospital sx={{ fontSize: 32, color: '#6366f1' }} />
                                <Typography variant="h6" fontWeight={700}>
                                    MedReserve<span style={{ color: '#6366f1' }}>AI</span>
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                AI-powered healthcare management platform for the modern age.
                            </Typography>
                            <Box className="social-links">
                                <IconButton href="https://github.com/rishith2903" target="_blank">
                                    <GitHub />
                                </IconButton>
                                <IconButton href="https://www.linkedin.com/in/rishith-kumar-pachipulusu-2748b4380/" target="_blank">
                                    <LinkedIn />
                                </IconButton>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                Product
                            </Typography>
                            <Box className="footer-links">
                                <Typography variant="body2" color="text.secondary">Features</Typography>
                                <Typography variant="body2" color="text.secondary">Pricing</Typography>
                                <Typography variant="body2" color="text.secondary">API Docs</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                Company
                            </Typography>
                            <Box className="footer-links">
                                <Typography variant="body2" color="text.secondary">About</Typography>
                                <Typography variant="body2" color="text.secondary">Blog</Typography>
                                <Typography variant="body2" color="text.secondary">Careers</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                Legal
                            </Typography>
                            <Box className="footer-links">
                                <Typography variant="body2" color="text.secondary">Privacy</Typography>
                                <Typography variant="body2" color="text.secondary">Terms</Typography>
                                <Typography variant="body2" color="text.secondary">HIPAA</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                Support
                            </Typography>
                            <Box className="footer-links">
                                <Typography variant="body2" color="text.secondary">Help Center</Typography>
                                <Typography variant="body2" color="text.secondary">Contact</Typography>
                                <Typography variant="body2" color="text.secondary">Status</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                    <Box className="footer-bottom">
                        <Typography variant="body2" color="text.secondary">
                            © 2024 MedReserve AI. All rights reserved. Built with ❤️ by Rishith Kumar Pachipulusu
                        </Typography>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default LandingPage;
