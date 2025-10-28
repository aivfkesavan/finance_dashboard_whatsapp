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

  // Chat View
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  // Audio playback
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Log API configuration on mount
    console.log('=== API Configuration ===');
    console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL || 'https://ippopay-dev-api.vibestud.io:8000');
    console.log('Environment:', import.meta.env.MODE);
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
      setSelectedPhone({ phone_number: phone.phone_number });

      const data = await phoneAPI.getPhoneDetails(phone.phone_number);
      console.log('=== Phone Details Received ===');
      console.log('Phone:', data.phone_number);
      console.log('Total conversations:', data.conversations?.length);

      // Check for audio messages
      const audioMessages = data.conversations?.filter(msg => msg.message_type === 'audio') || [];
      console.log('Audio messages found:', audioMessages.length);

      audioMessages.forEach((msg, idx) => {
        console.log(`Audio ${idx + 1}:`, {
          id: msg.id,
          message_type: msg.message_type,
          has_audio_object: !!msg.audio,
          audio_id: msg.audio?.id,
          audio_size: msg.audio?.file_size_mb,
          user_message: msg.user_message
        });
      });

      setSelectedPhone(data);
    } catch (err) {
      alert('Failed to load chat history');
      console.error(err);
      setSelectedPhone(null);
    } finally {
      setChatLoading(false);
    }
  };

  const handlePlayAudio = async (phoneNum, audioId) => {
    try {
      console.log('=== Audio Play Request ===');
      console.log('Phone:', phoneNum);
      console.log('Audio ID:', audioId);

      // If clicking the same audio that's playing, pause it
      if (playingAudioId === audioId && audioRef.current) {
        console.log('Pausing currently playing audio');
        audioRef.current.pause();
        setPlayingAudioId(null);
        audioRef.current = null;
        return;
      }

      // Stop any currently playing audio
      if (audioRef.current) {
        console.log('Stopping previous audio');
        audioRef.current.pause();
        audioRef.current = null;
      }

      console.log('Fetching audio from API...');
      const audioUrl = await audioAPI.playAudio(phoneNum, audioId);
      console.log('Audio URL received:', audioUrl);

      if (!audioUrl) {
        throw new Error('No audio URL returned from API');
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set playing state immediately
      setPlayingAudioId(audioId);

      // Add event listeners
      audio.addEventListener('loadeddata', () => {
        console.log('✓ Audio loaded successfully - ready to play');
      });

      audio.addEventListener('canplay', () => {
        console.log('✓ Audio can start playing');
      });

      audio.addEventListener('ended', () => {
        console.log('✓ Audio finished playing');
        setPlayingAudioId(null);
        audioRef.current = null;
        // Revoke the object URL to free memory
        URL.revokeObjectURL(audioUrl);
      });

      audio.addEventListener('error', (e) => {
        console.error('✗ Audio playback error:', e);
        console.error('Error details:', {
          error: audio.error,
          code: audio.error?.code,
          message: audio.error?.message,
          src: audio.src
        });
        alert(`Failed to play audio. Error: ${audio.error?.message || 'Unknown error'}`);
        setPlayingAudioId(null);
        audioRef.current = null;
        URL.revokeObjectURL(audioUrl);
      });

      console.log('Starting audio playback...');
      await audio.play();
      console.log('✓ Audio playing successfully');
    } catch (err) {
      console.error('✗ Failed to play audio:', err);
      console.error('Error stack:', err.stack);
      alert('Failed to play audio: ' + err.message);
      setPlayingAudioId(null);
      audioRef.current = null;
    }
  };

  const filteredPhones = phones.filter((phone) =>
    phone.phone_number.includes(searchQuery)
  );

  return (
    <div className="logs-page">
      {/* Left Panel - Phone List */}
      <div className="phone-list-panel">
        <div className="panel-header">
          <div>
            <h1>Conversations</h1>
            <p className="text-secondary">View chat history for all customers</p>
          </div>
          <button className="btn btn-primary" onClick={fetchPhones} disabled={loading}>
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-section">
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

        {/* Phone List */}
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
                className={`phone-item ${selectedPhone?.phone_number === phone.phone_number ? 'active' : ''}`}
                onClick={() => handlePhoneClick(phone)}
              >
                <div className="phone-avatar">
                  <Phone size={24} />
                </div>
                <div className="phone-info">
                  <div className="phone-header">
                    <h3 className="phone-number">{phone.phone_number}</h3>
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

      {/* Right Panel - Chat View */}
      <div className="chat-panel">
        {!selectedPhone ? (
          <div className="empty-chat-state">
            <MessageSquare size={64} />
            <h2>Select a conversation</h2>
            <p>Choose a phone number from the list to view chat history</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
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
            </div>

            {/* Chat Body */}
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
                              {msg.message_type === 'audio' && (
                                <div className="audio-indicator">
                                  {msg.audio ? (
                                    <>
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
                                              Playing...
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            <Play size={16} />
                                            <span>Voice Message</span>
                                          </>
                                        )}
                                      </button>
                                    </>
                                  ) : (
                                    <div className="audio-placeholder">
                                      <Play size={16} />
                                      <span>🎤 Voice Message (Audio data not available)</span>
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
                              {msg.transcript && msg.transcript.english_text && (
                                <p className="bubble-text-english">
                                  English: {msg.transcript.english_text}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Bot Response */}
                          <div className="chat-bubble bot-bubble">
                            <div className="bubble-content">
                              <p className="bubble-text">{msg.bot_response}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Chat Footer */}
            {!chatLoading && selectedPhone.summary && (
              <div className="chat-footer">
                <div className="chat-stats">
                  <span>💬 {selectedPhone.summary.text_messages} text</span>
                  <span>🎤 {selectedPhone.summary.audio_messages} audio</span>
                  <span>📅 Since {new Date(selectedPhone.summary.first_interaction).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
