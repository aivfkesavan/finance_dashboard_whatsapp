# IppoPay WhatsApp Bot Dashboard

A modern React dashboard for managing the IppoPay WhatsApp Bot ticketing system, built with Vite.

## Features

- **Authentication**: Secure login with JWT tokens
- **Dashboard**: Overview of ticket statistics
- **Ticket Management**: View, filter, assign, and update tickets
- **Conversation History**: View customer conversations with audio playback support
- **Logs & Monitoring**: Comprehensive logging system with multiple views
  - All conversations with audio and transcriptions
  - Phone-specific logs with detailed history
  - Recent activity monitoring
  - System logs viewer (Admin only)
- **Agent Management**: Create and manage support agents (Admin only)
- **RAG Data Management**: Upload and update knowledge base documents (Admin only)
- **Role-Based Access**: Different views for admins and agents

## Tech Stack

- React 19
- Vite
- React Router
- Axios
- Lucide React (icons)

## Prerequisites

- Node.js 16+
- npm or yarn
- Running backend API server (on port 8000)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Configuration

The API base URL is configured in `src/services/api.js`. By default, it points to `http://localhost:8000`.

To change the API URL, edit the `API_BASE_URL` constant:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Default Credentials

```
Username: admin
Password: admin123
```

## Project Structure

```
finance_dashboard_whatsapp/
├── src/
│   ├── components/          # Reusable components
│   │   ├── DashboardLayout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/            # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/              # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Tickets.jsx
│   │   ├── Logs.jsx
│   │   ├── Agents.jsx
│   │   └── RAGData.jsx
│   ├── services/           # API services
│   │   └── api.js
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   ├── App.css             # Global styles
│   └── index.css           # Base styles
├── index.html
├── vite.config.js
└── package.json
```

## Features by Role

### Admin Features
- View all tickets
- Assign tickets to agents
- Create and manage agents
- Update RAG knowledge base
- View all dashboard statistics

### Agent Features
- View assigned tickets
- Update ticket status
- View conversation history
- Play audio messages
- View personal statistics

## API Endpoints Used

### Authentication
- `POST /api/dashboard/auth/login` - User authentication
- `POST /api/dashboard/auth/register` - Create new agent

### Tickets
- `GET /api/dashboard/tickets` - Get tickets
- `POST /api/dashboard/tickets/{id}/assign` - Assign ticket
- `PUT /api/dashboard/tickets/{id}/status` - Update ticket status

### Conversations & Audio
- `GET /api/dashboard/conversations/{phone}` - Get conversations
- `GET /api/dashboard/audio/{phone}/{id}` - Get audio file

### Logs & Monitoring
- `GET /api/dashboard/logs/system` - Get system logs (Admin only)
- `GET /api/dashboard/logs/conversations` - Get all conversations with audio/transcripts
- `GET /api/dashboard/logs/phone/{phone}` - Get phone-specific logs
- `GET /api/dashboard/logs/recent` - Get recent activity

### Agents & Stats
- `GET /api/dashboard/agents` - Get all agents
- `GET /api/dashboard/stats` - Get dashboard statistics

### RAG Data
- `POST /api/dashboard/rag/update` - Update RAG data

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC
