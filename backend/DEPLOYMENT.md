# MedReserve Backend - Render Deployment Guide

## 🚀 Quick Deploy to Render

### Prerequisites
- GitHub repository with this backend code
- Render.com account (free tier available)
- Gmail account for email notifications

### Step 1: Prepare Environment Variables
Before deploying, gather these values:

```env
# Database (Render PostgreSQL)
DB_URL=jdbc:postgresql://your-db-host:5432/medreserve?sslmode=require
DB_USERNAME=medreserve_user
DB_PASSWORD=your_secure_password

# Email Configuration
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password

# Security
JWT_SECRET=your-very-secure-secret-key-minimum-32-characters

# CORS (Frontend URLs)
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
```

### Step 2: Deploy to Render

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Create Render Services**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select this backend folder
   - Render will auto-detect the Dockerfile

3. **Configure Environment Variables**
   - In Render Dashboard → Your Service → Environment
   - Add all the environment variables listed above
   - **Important**: Use secure values, not the examples

4. **Create Database**
   - In Render Dashboard → "New +" → "PostgreSQL"
   - Name: `medreserve-db`
   - Plan: Free
   - Copy the connection details to your environment variables

### Step 3: Verify Deployment

1. **Health Check**
   ```
   GET https://your-app-name.onrender.com/api/actuator/health
   ```

2. **Test API Endpoints**
   ```
   GET https://your-app-name.onrender.com/api/auth/test
   POST https://your-app-name.onrender.com/api/auth/register
   ```

### Step 4: Update Frontend Configuration

Update your frontend to use the new backend URL:
```javascript
const API_BASE_URL = 'https://your-app-name.onrender.com/api';
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify DB_URL format includes `?sslmode=require`
   - Check database credentials in Render dashboard

2. **Email Not Sending**
   - Use Gmail App Password, not regular password
   - Enable 2FA on Gmail account first

3. **CORS Errors**
   - Add your frontend domain to CORS_ALLOWED_ORIGINS
   - Include both production and development URLs

4. **Build Failures**
   - Check Dockerfile is in backend root
   - Verify pom.xml dependencies

### Logs and Monitoring
- View logs: Render Dashboard → Your Service → Logs
- Health endpoint: `/api/actuator/health`
- Application logs are written to `/logs/medreserve.log`

## 📝 Configuration Files

- `.render.yaml` - Render service configuration
- `Dockerfile` - Container build instructions
- `application-production.yml` - Production Spring Boot config
- `.gitignore` - Excludes sensitive files from Git

## 🔒 Security Notes

- Never commit real passwords to Git
- Use Render environment variables for secrets
- JWT_SECRET should be at least 32 characters
- Enable SSL/TLS in production (Render provides this automatically)

## 📞 Support

If you encounter issues:
1. Check Render service logs
2. Verify environment variables
3. Test database connectivity
4. Review Spring Boot actuator health endpoint
