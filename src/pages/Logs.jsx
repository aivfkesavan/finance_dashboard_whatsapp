import { useState, useEffect, useRef } from 'react';
import { phoneAPI, audioAPI } from '../services/api';
import {
  Phone,
  Play,
  Pause,
  MessageSquare,
  Search,
  RefreshCw
} from 'lucide-react';
import './Logs.css';

export const Logs = () => {
  const [loading, setLoading] = useState(false);
  const [phones, setPhones] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Chat Modal
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  // Audio playback
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchPhones();
  }, []);

  const fetchPhones = async () => {
    try {
      setLoading(true);
      const data = await phoneAPI.getAllPhones();
      setPhones(data.phones || []);
    } catch (err) {
      console.error('Failed to fetch phones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneClick = async (phone) => {
    try {
      setChatLoading(true);
      setShowChatModal(true);

      const data = await phoneAPI.getPhoneDetails(phone.phone_number);
      setSelectedPhone(data);
    } catch (err) {
      alert('Failed to load chat history');
      console.error(err);
      setShowChatModal(false);
    } finally {
      setChatLoading(false);
    }
  };

  const handlePlayAudio = async (phoneNum, audioId) => {
    try {
      // If clicking the same audio that's playing, pause it
      if (playingAudioId === audioId && audioRef.current) {
        audioRef.current.pause();
        setPlayingAudioId(null);
        audioRef.current = null;
        return;
      }

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      console.log('Playing audio:', phoneNum, audioId);
      const audioUrl = await audioAPI.playAudio(phoneNum, audioId);
      console.log('Audio URL created:', audioUrl);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set playing state immediately
      setPlayingAudioId(audioId);

      // Add event listeners
      audio.addEventListener('loadeddata', () => {
        console.log('Audio loaded successfully');
      });

      audio.addEventListener('ended', () => {
        console.log('Audio finished playing');
        setPlayingAudioId(null);
        audioRef.current = null;
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        alert('Failed to play audio. Please check console for details.');
        setPlayingAudioId(null);
        audioRef.current = null;
      });

      await audio.play();
      console.log('Audio playing...');
    } catch (err) {
      console.error('Failed to play audio:', err);
      alert('Failed to play audio: ' + err.message);
      setPlayingAudioId(null);
      audioRef.current = null;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredPhones = phones.filter((phone) =>
    phone.phone_number.includes(searchQuery)
  );

  return (
    <div className="logs-page">
      <div className="page-header">
        <div>
          <h1>Conversations</h1>
          <p className="text-secondary">View chat history for all customers</p>
        </div>
        <button className="btn btn-primary" onClick={fetchPhones} disabled={loading}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-section card">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search phone numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="stats-info">
          <span className="stat-badge">
            <Phone size={16} />
            {filteredPhones.length} customers
          </span>
        </div>
      </div>

      {/* Phone Numbers List */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading conversations...</p>
          </div>
        ) : filteredPhones.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={48} />
            <p>{searchQuery ? 'No phone numbers found' : 'No conversations yet'}</p>
          </div>
        ) : (
          <div className="phone-list">
            {filteredPhones.map((phone) => (
              <div
                key={phone.phone_number}
                className="phone-item"
                onClick={() => handlePhoneClick(phone)}
              >
                <div className="phone-avatar">
                  <Phone size={24} />
                </div>
                <div className="phone-info">
                  <div className="phone-header">
                    <h3 className="phone-number">{phone.phone_number}</h3>
                    <span className="time-badge">{formatRelativeTime(phone.last_interaction)}</span>
                  </div>
                  <div className="phone-meta">
                    <span className="meta-item">
                      <MessageSquare size={14} />
                      {phone.total_messages} messages
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Modal - WhatsApp Style */}
      {showChatModal && selectedPhone && (
        <div className="modal-overlay" onClick={() => setShowChatModal(false)}>
          <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <Phone size={20} />
                <div>
                  <h3>{selectedPhone.phone_number}</h3>
                  <p className="chat-subtitle">
                    {chatLoading
                      ? 'Loading...'
                      : `${selectedPhone.summary?.total_conversations || 0} messages`}
                  </p>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowChatModal(false)}
                title="Close"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="chat-body">
              {chatLoading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p className="loading-text">Loading messages...</p>
                </div>
              ) : !selectedPhone.conversations || selectedPhone.conversations.length === 0 ? (
                <div className="empty-state">
                  <MessageSquare size={48} />
                  <p>No messages found</p>
                </div>
              ) : (
                <div className="chat-messages">
                  {selectedPhone.conversations.map((msg, index) => {
                    const showDate =
                      index === 0 ||
                      new Date(msg.timestamp).toDateString() !==
                        new Date(selectedPhone.conversations[index - 1]?.timestamp).toDateString();

                    return (
                      <div key={msg.id || index}>
                        {showDate && (
                          <div className="date-separator">
                            {new Date(msg.timestamp).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        )}

                        <div className="chat-message-group">
                          {/* Customer Message */}
                          <div className="chat-bubble customer-bubble">
                            <div className="bubble-content">
                              {msg.message_type === 'audio' && msg.audio && (
                                <div className="audio-indicator">
                                  <button
                                    className={`play-audio-btn ${playingAudioId === msg.audio.id ? 'playing' : ''}`}
                                    onClick={() => handlePlayAudio(selectedPhone.phone_number, msg.audio.id)}
                                    title={playingAudioId === msg.audio.id ? 'Pause audio' : 'Play audio'}
                                  >
                                    {playingAudioId === msg.audio.id ? (
                                      <>
                                        <Pause size={16} />
                                        <span className="playing-text">
                                          <span className="audio-wave">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                          </span>
                                          Playing... ({msg.audio.file_size_mb} MB)
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <Play size={16} />
                                        <span>Voice Message ({msg.audio.file_size_mb} MB)</span>
                                      </>
                                    )}
                                  </button>
                                  {msg.transcript && (
                                    <div className="transcript-badge">
                                      <span>🌐 {msg.transcript.detected_language.toUpperCase()}</span>
                                      <span>{(msg.transcript.confidence_score * 100).toFixed(0)}%</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              <p className="bubble-text">{msg.user_message}</p>
                              {msg.transcript && msg.transcript.original_text !== msg.user_message && (
                                <p className="bubble-text-original">
                                  Original: {msg.transcript.original_text}
                                </p>
                              )}
                            </div>
                            <span className="bubble-time">{formatTime(msg.timestamp)}</span>
                          </div>

                          {/* Bot Response */}
                          <div className="chat-bubble bot-bubble">
                            <div className="bubble-content">
                              <p className="bubble-text">{msg.bot_response}</p>
                            </div>
                            <span className="bubble-time">{formatTime(msg.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Summary Footer */}
            {!chatLoading && selectedPhone.summary && (
              <div className="chat-footer">
                <div className="chat-stats">
                  <span>💬 {selectedPhone.summary.text_messages} text</span>
                  <span>🎤 {selectedPhone.summary.audio_messages} audio</span>
                  <span>📅 Since {new Date(selectedPhone.summary.first_interaction).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
