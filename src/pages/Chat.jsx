import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronLeft, User, Circle, ArrowLeft, MessageSquare, Clock, Paperclip, FileText, Download, Loader2, UserPlus, X, Bell } from 'lucide-react';
import { getChatUsers, getChatHistory, sendChatMessage, sendHeartbeat, sendTypingStatus, uploadChatFile, addChatContact } from '../services/api';

const Chat = ({ userId }) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [activeUser, setActiveUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingChat, setLoadingChat] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);

    // Mobile view state: 'list' or 'chat'
    const [mobileView, setMobileView] = useState('list');

    // Add Contact Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newContactIdentifier, setNewContactIdentifier] = useState('');
    const [addingContact, setAddingContact] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [modalSuccess, setModalSuccess] = useState(null);

    // In-App Toast Notification state
    const [inAppNotification, setInAppNotification] = useState(null);

    // Typing debounce reference
    const typingTimeoutRef = useRef(null);
    const [isTypingState, setIsTypingState] = useState(false);

    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const prevUnreadCountsRef = useRef({});
    const activeUserRef = useRef(null);
    const messagesRef = useRef([]);

    // Synchronize refs to avoid interval closures from depending on state
    useEffect(() => {
        activeUserRef.current = activeUser;
    }, [activeUser]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // Get absolute API base URL for attachments
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const getFileUrl = (url) => {
        if (!url) return '';
        return API_BASE_URL.replace('/api', '') + url;
    };

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Request desktop notifications permission
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }, []);

    // Verify authentication
    useEffect(() => {
        if (!userId) {
            navigate('/login');
        }
    }, [userId, navigate]);

    // Initial load and polling of contacts
    useEffect(() => {
        if (!userId) return;

        const loadUsers = async () => {
            try {
                const data = await getChatUsers();
                setUsers(data);
                
                // Track incoming messages for notifications
                data.forEach(user => {
                    const prevCount = prevUnreadCountsRef.current[user._id] || 0;
                    
                    // If unread count has increased, and we are not currently active in that user's chat
                    if (user.unreadCount > prevCount) {
                        const isCurrentActive = activeUserRef.current && activeUserRef.current._id === user._id;
                        if (!isCurrentActive) {
                            triggerMessageNotification(user);
                        }
                    }
                });

                // Store current unread counts for comparison in next poll
                const nextCounts = {};
                data.forEach(user => {
                    nextCounts[user._id] = user.unreadCount;
                });
                prevUnreadCountsRef.current = nextCounts;

                // Update active user context if they are in the list
                if (activeUserRef.current) {
                    const updatedActive = data.find(u => u._id === activeUserRef.current._id);
                    if (updatedActive) {
                        setActiveUser(prev => {
                            if (!prev) return null;
                            return {
                                ...prev,
                                lastSeen: updatedActive.lastSeen,
                                isTyping: updatedActive.isTyping
                            };
                        });
                    }
                }
                
                setError(null);
            } catch (err) {
                console.error('Failed to load chat users:', err);
                setError('Failed to load user list.');
            } finally {
                setLoadingUsers(false);
            }
        };

        loadUsers();

        // Polling users every 3 seconds for Phase 2/3 and heartbeat
        const userPollingInterval = setInterval(loadUsers, 3000);
        const heartbeatInterval = setInterval(() => {
            sendHeartbeat().catch(console.error);
        }, 15000);

        return () => {
            clearInterval(userPollingInterval);
            clearInterval(heartbeatInterval);
        };
    }, [userId]);

    // Fetch messages when active user changes
    useEffect(() => {
        if (!userId || !activeUser) {
            setMessages([]);
            setHasMore(false);
            return;
        }

        const loadChat = async () => {
            setLoadingChat(true);
            try {
                const history = await getChatHistory(activeUser._id);
                setMessages(history);
                setHasMore(history.length === 50); // Pagination threshold
                setTimeout(scrollToBottom, 100);
                
                // Reset unread count locally for this user
                setUsers(prevUsers => 
                    prevUsers.map(u => u._id === activeUser._id ? { ...u, unreadCount: 0 } : u)
                );
                // Sync notification ref count
                prevUnreadCountsRef.current[activeUser._id] = 0;
            } catch (err) {
                console.error('Failed to load chat history:', err);
            } finally {
                setLoadingChat(false);
            }
        };

        loadChat();
    }, [activeUser?._id, userId]);

    // Poll for new messages for active conversation (reduced interval, handles closures cleanly)
    useEffect(() => {
        const currentActiveUserId = activeUser?._id;
        if (!userId || !currentActiveUserId) return;

        const pollNewMessages = async () => {
            try {
                const history = await getChatHistory(currentActiveUserId);
                
                if (history.length > 0) {
                    const currentMessages = messagesRef.current;
                    const latestStored = currentMessages[currentMessages.length - 1];
                    const latestPolled = history[history.length - 1];

                    // Check for status receipt updates
                    const statusChanged = currentMessages.some((m) => {
                        const polledMsg = history.find(h => h._id === m._id);
                        return polledMsg && polledMsg.status !== m.status;
                    });

                    if (!latestStored || latestStored._id !== latestPolled._id || history.length !== currentMessages.length || statusChanged) {
                        const container = chatContainerRef.current;
                        const shouldScroll = container 
                            ? container.scrollHeight - container.scrollTop - container.clientHeight < 180 
                            : true;

                        setMessages(history);
                        if (shouldScroll) {
                            setTimeout(scrollToBottom, 100);
                        }
                    }
                } else if (messagesRef.current.length > 0) {
                    setMessages([]);
                }
            } catch (err) {
                console.error('Polling messages error:', err);
            }
        };

        // Poll messages every 2.5 seconds for snappy updates
        const messagePollInterval = setInterval(pollNewMessages, 2500);
        return () => clearInterval(messagePollInterval);
    }, [activeUser?._id, userId]);

    // Clean timers
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, []);

    // Push notification trigger
    const triggerMessageNotification = (senderUser) => {
        const senderName = formatDisplayName(senderUser.identifier);

        // 1. Trigger HTML5 Browser push notifications if minimized/hidden
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            if (document.hidden) {
                const notif = new Notification(`New Message from ${senderName}`, {
                    body: `Tap to open conversation thread.`,
                    icon: '/favicon.ico'
                });
                notif.onclick = () => {
                    window.focus();
                    setActiveUser(senderUser);
                    setMobileView('chat');
                    notif.close();
                };
            }
        }

        // 2. Trigger In-App Notification preview toast
        setInAppNotification({
            user: senderUser,
            name: senderName
        });

        // Auto-dismiss toast
        setTimeout(() => {
            setInAppNotification(null);
        }, 5000);
    };

    // Load older messages (Pagination)
    const loadOlderMessages = async () => {
        if (!activeUser || messages.length === 0 || loadingMore) return;

        setLoadingMore(true);
        try {
            const firstMessageTimestamp = messages[0].createdAt;
            const olderHistory = await getChatHistory(activeUser._id, firstMessageTimestamp);

            if (olderHistory.length > 0) {
                setMessages(prev => [...olderHistory, ...prev]);
                setHasMore(olderHistory.length === 50);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error('Failed to load older messages:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    // Handle typing events on text input changes
    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
        
        if (!isTypingState && activeUser) {
            setIsTypingState(true);
            sendTypingStatus(activeUser._id, true).catch(console.error);
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            if (activeUser) {
                sendTypingStatus(activeUser._id, false).catch(console.error);
            }
            setIsTypingState(false);
        }, 3000);
    };

    // Send Message Handler
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeUser) return;

        const textToSend = newMessage.trim();
        setNewMessage(''); // Clear input

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        if (activeUser) {
            sendTypingStatus(activeUser._id, false).catch(console.error);
        }
        setIsTypingState(false);

        try {
            const sentMsg = await sendChatMessage(activeUser._id, textToSend);
            setMessages(prev => [...prev, sentMsg]);
            setTimeout(scrollToBottom, 50);
        } catch (err) {
            console.error('Failed to send message:', err);
            setError('Failed to send message. Please try again.');
        }
    };

    // Add Contact handler
    const handleAddContactSubmit = async (e) => {
        e.preventDefault();
        if (!newContactIdentifier.trim()) return;

        setAddingContact(true);
        setModalError(null);
        setModalSuccess(null);

        try {
            const res = await addChatContact(newContactIdentifier);
            setModalSuccess(res.message || 'Contact added successfully!');
            
            // Prepend new contact to local users list
            setUsers(prev => [res.contact, ...prev]);

            setTimeout(() => {
                setShowAddModal(false);
                setNewContactIdentifier('');
                setModalSuccess(null);
            }, 1500);
        } catch (err) {
            console.error('Failed to add contact:', err);
            setModalError(err.response?.data?.error || 'Failed to add contact. Ensure user exists.');
        } finally {
            setAddingContact(false);
        }
    };

    // Handle attachment uploads
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeUser) return;

        setUploadingFile(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        if (activeUser) {
            sendTypingStatus(activeUser._id, false).catch(console.error);
        }
        setIsTypingState(false);

        try {
            const uploadRes = await uploadChatFile(file);
            const sentMsg = await sendChatMessage(activeUser._id, '', uploadRes.attachmentUrl, uploadRes.attachmentType);
            setMessages(prev => [...prev, sentMsg]);
            setTimeout(scrollToBottom, 100);
        } catch (err) {
            console.error('File upload error:', err);
            setError('Failed to send attachment.');
        } finally {
            setUploadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Format display name from identifier
    const formatDisplayName = (identifier) => {
        if (!identifier) return 'User';
        if (identifier.includes('@')) {
            return identifier.split('@')[0];
        }
        return identifier;
    };

    // Helper: Determine if user is online (active in last 60 seconds)
    const isUserOnline = (lastSeen) => {
        if (!lastSeen) return false;
        const diffMs = new Date() - new Date(lastSeen);
        return diffMs < 60000;
    };

    // Helper: Format online status label
    const formatOnlineLabel = (user) => {
        if (user.isTyping) return 'typing...';
        if (isUserOnline(user.lastSeen)) return 'Online';
        if (!user.lastSeen) return 'Offline';

        const lastSeenDate = new Date(user.lastSeen);
        const diffMs = new Date() - lastSeenDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        if (diffMins < 1) return 'Offline';
        if (diffMins < 60) return `Active ${diffMins}m ago`;
        if (diffHours < 24) return `Active ${diffHours}h ago`;
        return `Active ${lastSeenDate.toLocaleDateString()}`;
    };

    // Helper: Format message time
    const formatMessageTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Helper: Render double tick read receipts
    const renderStatusTicks = (msg) => {
        if (msg.status === 'read' || msg.isRead) {
            return <span className="status-tick read">✓✓</span>;
        }
        if (msg.status === 'delivered') {
            return <span className="status-tick delivered">✓✓</span>;
        }
        return <span className="status-tick sent">✓</span>;
    };

    return (
        <div className="chat-page-container container">
            
            {/* In-App Push Notification banner */}
            <AnimatePresence>
                {inAppNotification && (
                    <motion.div 
                        initial={{ opacity: 0, y: -50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="chat-in-app-banner"
                        onClick={() => {
                            setActiveUser(inAppNotification.user);
                            setMobileView('chat');
                            setInAppNotification(null);
                        }}
                    >
                        <div className="banner-icon-wrap">
                            <Bell size={18} />
                        </div>
                        <div className="banner-content">
                            <h4>{inAppNotification.name}</h4>
                            <p>Sent you a new message</p>
                        </div>
                        <button className="banner-close-btn" onClick={(e) => { e.stopPropagation(); setInAppNotification(null); }}>
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`chat-card ${mobileView === 'chat' ? 'mobile-chat-active' : 'mobile-list-active'}`}>
                
                {/* Users Sidebar/Panel */}
                <div className="chat-sidebar">
                    <div className="chat-sidebar-header">
                        <button className="chat-back-arrow" onClick={() => navigate(-1)} title="Back">
                            <ChevronLeft size={24} />
                        </button>
                        <h2>Conversations</h2>
                        
                        {/* Add Contact Button */}
                        <button 
                            className="chat-add-user-btn" 
                            onClick={() => setShowAddModal(true)} 
                            title="Add Contact"
                        >
                            <UserPlus size={18} />
                        </button>
                    </div>

                    <div className="chat-users-list">
                        {loadingUsers ? (
                            <div className="chat-users-loader">
                                <div className="mini-spinner"></div>
                                <span>Loading contacts...</span>
                            </div>
                        ) : error && users.length === 0 ? (
                            <div className="chat-error">{error}</div>
                        ) : users.length === 0 ? (
                            <div className="chat-empty-users">
                                <MessageSquare size={32} className="chat-empty-icon" />
                                <p>No contacts added yet.</p>
                                <p className="chat-sub">Click the + icon above to search and add contacts by mobile or email.</p>
                            </div>
                        ) : (
                            users.map((user) => {
                                const online = isUserOnline(user.lastSeen);
                                const isSelected = activeUser && activeUser._id === user._id;

                                return (
                                    <div
                                        key={user._id}
                                        className={`chat-user-item ${isSelected ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveUser(user);
                                            setMobileView('chat');
                                        }}
                                    >
                                        <div className="chat-user-avatar-wrap">
                                            <div className="chat-user-avatar">
                                                <User size={20} />
                                            </div>
                                            <span className={`chat-user-status-dot ${online ? 'online' : 'offline'}`}></span>
                                        </div>

                                        <div className="chat-user-details">
                                            <span className="chat-user-name">{formatDisplayName(user.identifier)}</span>
                                            <span className={`chat-user-subtext ${user.isTyping ? 'typing-text' : ''}`}>
                                                {user.isTyping ? 'typing...' : online ? 'Online' : 'Offline'}
                                            </span>
                                        </div>

                                        {user.unreadCount > 0 && (
                                            <span className="chat-unread-badge">{user.unreadCount}</span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Message Thread Panel */}
                <div className="chat-thread-container">
                    {activeUser ? (
                        <>
                            {/* Chat Thread Header */}
                            <div className="chat-thread-header">
                                <button 
                                    className="chat-thread-back-btn" 
                                    onClick={() => setMobileView('list')}
                                    title="Back to list"
                                >
                                    <ArrowLeft size={20} />
                                </button>

                                <div className="chat-thread-user-info">
                                    <div className="chat-user-avatar-wrap">
                                        <div className="chat-user-avatar header-avatar">
                                            <User size={18} />
                                        </div>
                                        <span className={`chat-user-status-dot ${isUserOnline(activeUser.lastSeen) ? 'online' : 'offline'}`}></span>
                                    </div>
                                    <div className="chat-header-meta">
                                        <h3>{formatDisplayName(activeUser.identifier)}</h3>
                                        <span className={`chat-header-status-text ${activeUser.isTyping ? 'typing-text' : ''}`}>
                                            {formatOnlineLabel(activeUser)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Messages Body */}
                            <div 
                                className="chat-messages-body" 
                                ref={chatContainerRef}
                            >
                                {hasMore && (
                                    <button 
                                        onClick={loadOlderMessages} 
                                        className="chat-load-more-btn"
                                        disabled={loadingMore}
                                    >
                                        {loadingMore ? 'Loading older...' : 'Load older messages'}
                                    </button>
                                )}

                                {loadingChat ? (
                                    <div className="chat-thread-loader">
                                        <div className="mini-spinner"></div>
                                        <span>Retrieving messages...</span>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="chat-thread-empty">
                                        <MessageSquare size={40} className="chat-empty-icon" />
                                        <p>Start a conversation with {formatDisplayName(activeUser.identifier)}!</p>
                                        <p className="chat-sub">Your messages are stored securely.</p>
                                    </div>
                                ) : (
                                    <div className="chat-messages-list">
                                        {messages.map((msg) => {
                                            const isMe = msg.senderId === userId;
                                            const hasAttachment = !!msg.attachmentUrl;

                                            return (
                                                <div 
                                                    key={msg._id} 
                                                    className={`chat-message-row ${isMe ? 'message-right' : 'message-left'}`}
                                                >
                                                    <div className="chat-message-bubble-wrap">
                                                        <div className={`chat-message-bubble ${hasAttachment ? 'has-attachment' : ''}`}>
                                                            
                                                            {/* Inline Image Attachment */}
                                                            {hasAttachment && msg.attachmentType === 'image' && (
                                                                <img 
                                                                    src={getFileUrl(msg.attachmentUrl)} 
                                                                    alt="Image Attachment" 
                                                                    className="chat-image-attachment"
                                                                    onClick={() => window.open(getFileUrl(msg.attachmentUrl), '_blank')}
                                                                />
                                                            )}

                                                            {/* Inline Document Attachment */}
                                                            {hasAttachment && msg.attachmentType === 'file' && (
                                                                <div className="chat-file-attachment">
                                                                    <FileText size={20} className="file-icon" />
                                                                    <div className="file-details">
                                                                        <span className="file-name">
                                                                            {msg.attachmentUrl.split('/').pop().split('-').slice(1).join('-') || 'Document'}
                                                                        </span>
                                                                    </div>
                                                                    <a 
                                                                        href={getFileUrl(msg.attachmentUrl)} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer" 
                                                                        className="file-download-btn"
                                                                        title="Download File"
                                                                    >
                                                                        <Download size={14} />
                                                                    </a>
                                                                </div>
                                                            )}

                                                            {/* Message text */}
                                                            {msg.message && <p className="chat-message-text">{msg.message}</p>}
                                                            
                                                            <div className="chat-message-meta">
                                                                <Clock size={10} className="chat-meta-icon" />
                                                                <span>{formatMessageTime(msg.createdAt)}</span>
                                                                {isMe && renderStatusTicks(msg)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Chat Thread Input Footer */}
                            <form className="chat-thread-footer" onSubmit={handleSend}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                    accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                                />
                                
                                <button 
                                    type="button" 
                                    className="chat-attach-btn" 
                                    onClick={triggerFileInput} 
                                    disabled={uploadingFile}
                                    title="Attach File/Image"
                                >
                                    {uploadingFile ? <Loader2 size={18} className="mini-spinner" /> : <Paperclip size={18} />}
                                </button>

                                <input
                                    type="text"
                                    placeholder={uploadingFile ? "Uploading attachment..." : "Type your message..."}
                                    value={newMessage}
                                    onChange={handleInputChange}
                                    maxLength={2000}
                                    autoFocus
                                    disabled={uploadingFile}
                                />
                                <button type="submit" disabled={(!newMessage.trim() && !uploadingFile) || uploadingFile} title="Send Message">
                                    <Send size={18} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="chat-thread-placeholder">
                            <MessageSquare size={64} className="chat-placeholder-icon" />
                            <h2>Your Conversations</h2>
                            <p>Select a contact from the sidebar or click the "+" button to add one.</p>
                        </div>
                    )}
                </div>

            </div>

            {/* Add Contact Modal overlay */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="chat-modal-overlay">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="chat-modal-card"
                        >
                            <div className="chat-modal-header">
                                <h3>Add Contact</h3>
                                <button className="chat-modal-close" onClick={() => { setShowAddModal(false); setModalError(null); setNewContactIdentifier(''); }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddContactSubmit} className="chat-modal-form">
                                <p className="chat-modal-sub">Enter the registered email or mobile number of the user you want to chat with.</p>
                                
                                {modalError && <div className="chat-modal-error">{modalError}</div>}
                                {modalSuccess && <div className="chat-modal-success">{modalSuccess}</div>}

                                <input
                                    type="text"
                                    placeholder="Enter Mobile Number or Email"
                                    value={newContactIdentifier}
                                    onChange={(e) => setNewContactIdentifier(e.target.value)}
                                    disabled={addingContact}
                                    required
                                    autoFocus
                                />

                                <button type="submit" disabled={addingContact || !newContactIdentifier.trim()}>
                                    {addingContact ? <Loader2 size={16} className="mini-spinner" /> : 'Add to Contacts'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Chat;
