# Quick Start Guide

## Getting Started in 3 Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The dashboard will be available at: `http://localhost:3000`

### 3. Login

Use these default credentials:
- **Username:** `admin`
- **Password:** `admin123`

## Important Notes

### Backend API Required
Make sure your backend API server is running on `http://localhost:8000` before starting the dashboard.

### First Time Setup
If you get a login error:
1. Verify the backend API is running
2. Check that the database has the admin user created
3. Verify the API URL in `src/services/api.js` matches your backend

## Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features Overview

### Dashboard (/)
- View ticket statistics
- Overview of open, assigned, and resolved tickets

### Tickets (/tickets)
- View all tickets (admin) or assigned tickets (agent)
- Filter tickets by status
- Assign tickets to agents (admin only)
- Update ticket status
- View conversation history
- Play audio messages

### Agents (/agents) - Admin Only
- View all agents
- Create new agents
- View agent details and activity

### RAG Data (/rag-data) - Admin Only
- Upload knowledge base documents
- Supported formats: .xlsx, .xls, .csv, .pdf, .docx, .txt, .md
- Replace existing RAG data with new files

## Common Issues

### Cannot connect to API
**Solution:** Update the API base URL in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://your-server:8000';
```

### 401 Unauthorized
**Solution:** Your token may have expired. Logout and login again.

### CORS errors
**Solution:** Make sure your backend has CORS enabled for `http://localhost:3000`

## Project Structure

```
src/
├── components/       # Reusable components
├── context/         # React contexts (auth, etc.)
├── pages/           # Page components (routes)
├── services/        # API service layer
└── utils/           # Utility functions
```

## Next Steps

1. Customize the theme colors in `src/index.css`
2. Update the API URL if your backend is on a different port
3. Add additional features as needed
4. Deploy to production using `npm run build`

## Support

For issues or questions, refer to the main README.md or check the API documentation.
