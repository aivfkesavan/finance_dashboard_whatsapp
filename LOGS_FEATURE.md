# Logs & Monitoring Feature Documentation

## Overview

The Logs & Monitoring feature provides comprehensive visibility into system operations, conversations, and user activity. It includes four distinct views accessible through a tabbed interface.

## Feature Location

**Route:** `/logs`
**Navigation:** Accessible to all authenticated users (with some admin-only features)
**Icon:** FileText (document icon)

---

## Tab Views

### 1. Conversations Tab

**Purpose:** View all conversations with complete details including audio and transcriptions

#### Features
- **Pagination**: Configurable conversation limit (25, 50, 100, 200)
- **Real-time Refresh**: Manual refresh button to get latest data
- **Audio Playback**: Click play button to listen to voice messages
- **Transcription Display**: View original text and English translation
- **Metadata**: Shows language detection and confidence scores

#### Information Displayed
- Phone number
- Message type (text/audio)
- Customer message
- Bot response
- Timestamp
- Audio file information (filename, size)
- Transcript details:
  - Original text (in detected language)
  - English translation
  - Detected language
  - Confidence score

#### Example Use Cases
1. **Quality Assurance**: Review bot responses for accuracy
2. **Training**: Use conversations to improve bot responses
3. **Customer Insights**: Understand common queries and patterns
4. **Audio Analysis**: Listen to customer tone and intent

---

### 2. Phone Logs Tab

**Purpose:** Search for and view all activity for a specific phone number

#### Features
- **Search by Phone**: Enter phone number to get complete history
- **Summary Statistics**:
  - Total conversations
  - Total audio files
  - Total transcripts
- **Comprehensive History**: All conversations chronologically ordered
- **Audio Playback**: Play audio messages from the phone-specific view

#### How to Use
1. Enter phone number in search box (e.g., `917299859147`)
2. Click "Search" button
3. View summary statistics at the top
4. Browse through all conversations below

#### Information Displayed
- Summary dashboard with key metrics
- All conversations with:
  - Message type
  - Timestamps
  - Customer messages
  - Bot responses
  - Audio playback option

#### Example Use Cases
1. **Customer Support**: View complete interaction history
2. **Issue Investigation**: Track conversation flow for troubleshooting
3. **Customer Profile**: Understand individual user behavior
4. **Escalation Research**: Review history before agent callback

---

### 3. Recent Activity Tab

**Purpose:** Monitor real-time activity and recent system usage

#### Features
- **Time Range Selection**:
  - Last 15 minutes
  - Last 30 minutes
  - Last 1 hour
  - Last 3 hours
  - Last 24 hours
- **Activity Statistics**:
  - Total conversations
  - Unique users
  - Audio files processed
- **Recent Conversations List**: Shows latest interactions

#### Information Displayed
- **Top Stats Cards**:
  - Conversations count with icon
  - Unique users count
  - Audio files count
- **Recent Conversations**:
  - Phone numbers
  - Message types
  - Full conversation content
  - Timestamps

#### Example Use Cases
1. **Live Monitoring**: Watch incoming conversations in near real-time
2. **Traffic Analysis**: See peak usage times
3. **System Health**: Monitor active user counts
4. **Quick Overview**: Get snapshot of recent activity

---

### 4. System Logs Tab (Admin Only)

**Purpose:** View application and system logs for debugging and monitoring

#### Features
- **Log Level Filtering**:
  - All Levels
  - INFO
  - WARNING
  - ERROR
  - DEBUG
- **Line Count Selection**:
  - 50 lines
  - 100 lines
  - 500 lines
  - 1000 lines
- **Color-Coded Output**: Different colors for different log levels
- **Scrollable Output**: Large log output with scroll capability

#### Information Displayed
- Raw log entries from `logs/app.log`
- Timestamp for each entry
- Log level indicator
- Full log message

#### Log Level Colors
- **INFO**: Blue left border
- **WARNING**: Orange left border with background highlight
- **ERROR**: Red left border with background highlight
- **DEBUG**: Purple left border, slightly faded

#### Example Use Cases
1. **Debugging**: Investigate errors and exceptions
2. **System Monitoring**: Watch for warnings and errors
3. **Performance Analysis**: Review system behavior
4. **Troubleshooting**: Find root cause of issues

---

## UI Components

### Tab Navigation
- Clean tabbed interface at the top
- Icons for each tab (visual recognition)
- Active tab highlighting
- Smooth transitions

### Action Buttons
- **Refresh Button**: Update data without page reload
- **Play Button**: Audio playback (uses browser's audio player)
- **Search Button**: Execute phone number search

### Filter Controls
- Dropdown selects for:
  - Log levels
  - Line counts
  - Time ranges
  - Conversation limits

### Data Display
- **Cards**: Conversations displayed in bordered cards
- **Color Coding**: Different backgrounds for user/bot messages
- **Badges**: Visual indicators for message types
- **Icons**: Phone, message, clock icons for context

---

## Technical Implementation

### API Integration

All data is fetched from the backend using these endpoints:

```javascript
// Get all conversations
logsAPI.getAllConversations(limit)

// Get phone-specific logs
logsAPI.getPhoneLogs(phoneNumber, limit)

// Get recent activity
logsAPI.getRecentActivity(minutes)

// Get system logs (admin only)
logsAPI.getSystemLogs(lines, level)
```

### Audio Playback

Audio files are streamed from the backend with authentication:

```javascript
audioAPI.playAudio(phoneNumber, audioId)
```

The audio is fetched as a blob and played using the browser's native Audio API.

### State Management

Local state for each tab:
- Loading indicators
- Error handling
- Data caching
- User preferences (limits, filters)

---

## Permissions & Access

### All Users Can:
- View all conversations
- Search phone-specific logs
- Monitor recent activity
- Play audio messages
- View transcriptions

### Admins Only Can:
- Access System Logs tab
- View application logs
- Filter by log levels
- See detailed system information

---

## Performance Considerations

### Pagination
- Default limits to prevent large data transfers
- Configurable page sizes
- Efficient data loading

### Caching
- Data cached per tab
- Manual refresh required for updates
- Prevents unnecessary API calls

### Loading States
- Spinner shown during data fetch
- Disabled buttons during operations
- Error messages for failed requests

---

## Use Case Scenarios

### Scenario 1: Customer Issue Investigation
**User Role:** Agent
**Tab:** Phone Logs

1. Customer calls with an issue
2. Agent opens Logs page
3. Switches to "Phone Logs" tab
4. Enters customer's phone number
5. Reviews conversation history
6. Identifies the problem from chat logs
7. Listens to audio if needed for tone/context
8. Provides solution based on history

### Scenario 2: System Health Check
**User Role:** Admin
**Tab:** Recent Activity + System Logs

1. Admin wants to check system status
2. Opens "Recent Activity" tab
3. Selects "Last 1 hour" time range
4. Reviews conversation volume
5. Checks unique user count
6. Switches to "System Logs" tab
7. Filters for ERROR level
8. Investigates any error messages

### Scenario 3: Quality Assurance Review
**User Role:** Agent or Admin
**Tab:** Conversations

1. QA team reviews bot performance
2. Opens "Conversations" tab
3. Sets limit to 100 conversations
4. Reviews bot responses for accuracy
5. Checks transcription quality
6. Plays audio to verify transcription
7. Notes any issues for improvement

### Scenario 4: Real-time Monitoring
**User Role:** Admin
**Tab:** Recent Activity

1. During peak hours, admin monitors traffic
2. Opens "Recent Activity" tab
3. Sets to "Last 15 minutes"
4. Watches unique user count
5. Refreshes every few minutes
6. Monitors for unusual patterns
7. Takes action if needed

---

## Best Practices

### For Regular Use
1. **Start with Recent Activity**: Get quick overview
2. **Use Phone Logs for Deep Dives**: Specific user issues
3. **Regular Conversations Review**: Quality assurance
4. **Set Appropriate Limits**: Balance data vs performance

### For Admins
1. **Check System Logs Daily**: Monitor for errors
2. **Filter by ERROR Level First**: Find critical issues
3. **Increase Line Count for Deep Investigation**: Get full context
4. **Use Multiple Tabs**: Cross-reference information

### For Troubleshooting
1. **Start with Phone Logs**: Get user-specific context
2. **Check Recent Activity**: See if issue is widespread
3. **Review System Logs**: Find technical errors
4. **Play Audio**: Understand customer intent

---

## Keyboard Shortcuts

Currently not implemented, but suggested additions:
- `Ctrl/Cmd + R`: Refresh current tab
- `Tab`: Navigate between tabs
- `Enter`: Execute search (in Phone Logs)

---

## Mobile Responsiveness

The Logs page is fully responsive:
- Tabs scroll horizontally on small screens
- Cards stack vertically
- Filters stack in mobile view
- Touch-friendly buttons
- Scrollable log output

---

## Future Enhancements

### Potential Features
1. **Export to CSV**: Download logs for external analysis
2. **Advanced Filters**: Filter by date range, message type
3. **Search Within Logs**: Find specific keywords
4. **Auto-Refresh**: Automatic data updates
5. **WebSocket Integration**: Real-time updates
6. **Bookmarks**: Save specific conversations
7. **Notes**: Add internal notes to conversations
8. **Sentiment Analysis**: Display customer sentiment
9. **Response Time Metrics**: Track bot performance
10. **Batch Operations**: Bulk actions on conversations

---

## Troubleshooting

### Common Issues

**Issue: No data showing**
- Check if backend API is running
- Verify authentication token is valid
- Check browser console for errors

**Issue: Audio won't play**
- Verify audio file exists on backend
- Check browser audio permissions
- Try different browser

**Issue: System Logs tab not visible**
- Verify user has admin role
- Check authentication
- Reload page

**Issue: Slow loading**
- Reduce conversation limit
- Reduce log line count
- Check network connection
- Check backend performance

---

## API Response Examples

### Conversations API Response
```json
{
  "status": "success",
  "count": 50,
  "conversations": [
    {
      "id": 123,
      "phone_number": "917299859147",
      "user_message": "What is cine finance?",
      "bot_response": "Cine Finance is...",
      "message_type": "text",
      "timestamp": "2025-10-28T02:42:04",
      "audio": {
        "id": 45,
        "filename": "audio_123.ogg",
        "file_size_mb": 0.5
      },
      "transcript": {
        "original_text": "வேலை செய்யவே மாட்டந்து",
        "english_text": "not working",
        "detected_language": "ta",
        "confidence_score": 0.95
      }
    }
  ]
}
```

### Recent Activity API Response
```json
{
  "status": "success",
  "summary": {
    "total_conversations": 25,
    "unique_users": 18,
    "audio_files": 12
  },
  "conversations": [...]
}
```

---

## Security Notes

- All API calls require valid JWT token
- System Logs restricted to admin users
- No sensitive data exposed in logs
- Audio files served with authentication
- HTTPS recommended for production

---

## Conclusion

The Logs & Monitoring feature provides comprehensive visibility into the WhatsApp Bot system, enabling:
- Effective customer support
- System monitoring
- Quality assurance
- Issue troubleshooting
- Performance analysis

With its tabbed interface and multiple views, it serves both day-to-day operations and deep technical investigation needs.
