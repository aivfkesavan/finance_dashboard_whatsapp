# Feature Documentation

## Authentication System

### Login Page
- **Location:** `/login`
- **Features:**
  - Username and password authentication
  - JWT token-based authentication
  - Automatic token refresh
  - Remember me functionality (via localStorage)
  - Error handling with user-friendly messages
- **Design:** Gradient background with modern card-based form

### Protected Routes
- Automatic redirect to login if not authenticated
- Role-based access control (admin vs agent)
- Token expiration handling
- Persistent session across page refreshes

---

## Dashboard (Home Page)

### Statistics Overview
- **Location:** `/`
- **Access:** All authenticated users

#### Stat Cards
1. **Total Tickets** - Shows overall ticket count
2. **Open Tickets** - New tickets awaiting assignment
3. **In Progress** - Assigned and active tickets
4. **Resolved** - Completed and closed tickets

#### Detailed Breakdown
- Status-wise ticket distribution
- Color-coded badges for easy identification
- Real-time data updates

---

## Ticket Management

### Ticket List
- **Location:** `/tickets`
- **Access:** All users (filtered by role)

#### Features for All Users
- **View Tickets:**
  - Ticket ID
  - Customer phone number
  - Customer query (truncated preview)
  - Current status with color-coded badges
  - Assigned agent information
  - Creation timestamp
  - Action buttons

- **Filter Tickets:**
  - All tickets
  - Open
  - Assigned
  - In Progress
  - Resolved
  - Closed

- **View Conversations:**
  - Click message icon to see full conversation history
  - Modal popup with customer info
  - Chronological message display
  - Audio playback for voice messages

#### Admin-Only Features
- **Assign Tickets:**
  - Dropdown to select agent
  - Instant assignment
  - Automatic status update to "assigned"

- **View All Tickets:**
  - See tickets from all agents
  - System-wide ticket overview

#### Agent Features
- **View Assigned Tickets:**
  - Only see tickets assigned to them
  - Personal queue management

- **Update Status:**
  - In Progress
  - Resolved
  - Add notes to tickets

### Conversation History Modal
- **Trigger:** Click conversation icon on any ticket
- **Features:**
  - Customer phone number display
  - Ticket ID reference
  - Full message history
  - User messages (gray background)
  - Bot responses (blue background)
  - Timestamp for each conversation
  - Audio playback button for voice messages
  - Scrollable list for long conversations

### Audio Playback
- **Feature:** Play customer voice messages
- **How it works:**
  - Click play icon next to audio messages
  - Audio streams from backend
  - Automatic authentication via JWT token
  - Browser-native audio player

---

## Agent Management

### Agent List
- **Location:** `/agents`
- **Access:** Admin only

#### Features
- **View All Agents:**
  - Card-based layout
  - Avatar with initial letter
  - Full name and username
  - Email address
  - Role badge (admin/agent)
  - Join date
  - Last login timestamp
  - Active/inactive status

- **Create New Agent:**
  - Click "Add Agent" button
  - Form with fields:
    - Username (unique)
    - Email
    - Full name
    - Password (minimum 8 characters)
    - Role selection (admin/agent)
  - Validation and error handling
  - Success notification

#### Design Elements
- Color-coded role badges
- Gradient avatar backgrounds
- Status indicators with dots
- Hover effects on cards
- Responsive grid layout

---

## RAG Data Management

### Upload Interface
- **Location:** `/rag-data`
- **Access:** Admin only

#### Features
- **Upload Documents:**
  - Multiple file selection
  - Drag-and-drop support
  - Supported formats:
    - Excel (.xlsx, .xls)
    - CSV (.csv)
    - PDF (.pdf)
    - Word (.docx)
    - Text (.txt)
    - Markdown (.md)
  - File size display
  - Preview selected files before upload

- **Update Process:**
  1. Validates all files
  2. Deletes existing RAG data (with warning)
  3. Uploads new files
  4. Re-indexes documents
  5. Updates vector database
  6. Shows detailed results

#### Warning System
- **Destructive Operation Alert:**
  - Yellow warning banner
  - Clear messaging about data deletion
  - Confirmation before proceeding

#### Result Display
- **Upload Summary:**
  - Number of deleted old files
  - Number of uploaded new files
  - Total documents indexed
  - Vector database points count
  - List of uploaded files with sizes
  - List of deleted files

---

## Navigation & Layout

### Sidebar Navigation
- **Collapsible Design:**
  - Toggle button to expand/collapse
  - Icon-only mode when collapsed
  - Full labels when expanded
  - Smooth animations

- **Menu Items:**
  - Dashboard (all users)
  - Tickets (all users)
  - Agents (admin only)
  - RAG Data (admin only)

- **Active State:**
  - Highlighted current page
  - Color-coded indicator bar
  - Visual feedback on hover

### User Info Section
- Display current user name
- Show user role
- Quick logout button

---

## Design System

### Color Scheme
- **Primary:** Indigo (#4f46e5)
- **Success:** Green (#10b981)
- **Warning:** Amber (#f59e0b)
- **Danger:** Red (#ef4444)
- **Background:** Light gray (#f5f5f5)

### Status Badge Colors
- **Open:** Blue
- **Assigned:** Yellow
- **In Progress:** Indigo
- **Resolved:** Green
- **Closed:** Gray

### Typography
- **Font Family:** System fonts (San Francisco, Segoe UI, etc.)
- **Headings:** Bold, clear hierarchy
- **Body Text:** Readable, comfortable line height

### Components
- **Cards:** White background, subtle shadows
- **Buttons:** Rounded corners, hover effects
- **Forms:** Clean inputs with focus states
- **Tables:** Hover rows, responsive design
- **Modals:** Overlay with blur, centered content

---

## Responsive Design

### Mobile Support
- Collapsible sidebar
- Touch-friendly buttons
- Scrollable tables
- Stacked form layouts
- Adaptive grid systems

### Breakpoints
- Desktop: > 768px
- Mobile: < 768px

---

## Security Features

### Authentication
- JWT token-based authentication
- Token stored in localStorage
- Automatic token injection in API calls
- Token expiration handling
- Auto-logout on 401 errors

### Authorization
- Role-based access control
- Protected routes
- Admin-only features
- Server-side validation

### Data Protection
- HTTPS recommended for production
- Secure password handling
- No sensitive data in URLs
- Safe file upload validation

---

## Performance Optimizations

### Code Splitting
- Route-based code splitting
- Lazy loading of components
- Optimized bundle size (~95KB gzipped)

### API Optimization
- Axios interceptors for auth
- Error handling and retry logic
- Efficient data fetching
- Minimal re-renders

### User Experience
- Loading spinners
- Optimistic UI updates
- Error messages
- Success notifications
- Smooth transitions

---

## Accessibility

### Keyboard Navigation
- Tab navigation support
- Focus indicators
- Enter key for form submission

### Screen Reader Support
- Semantic HTML
- ARIA labels where needed
- Alt text for icons

### Visual Accessibility
- High contrast text
- Clear focus states
- Readable font sizes
- Color-blind friendly palette

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Future Enhancements

### Potential Features
- Real-time notifications
- WebSocket for live updates
- Advanced analytics dashboard
- Ticket search functionality
- Export tickets to CSV
- Bulk operations
- Custom filters and saved views
- Dark mode support
- Multi-language support
- Email notifications
- File attachments to tickets
- Ticket comments/notes system
- Agent performance metrics
- Customer satisfaction ratings
