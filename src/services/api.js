import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log("API BASE:", API_BASE_URL);

export const getRandomVerse = async (lang = 'en') => {
    const response = await axios.get(`${API_BASE_URL}/random?lang=${lang}`);
    return response.data;
};

export const getVerseByMood = async (mood, lang = 'en') => {
    const response = await axios.get(`${API_BASE_URL}/mood/${mood}?lang=${lang}`);
    return response.data;
};

export const getSpecificVerse = async (book, chapter, verse, lang = 'en') => {
    const response = await axios.get(`${API_BASE_URL}/verse/${book}/${chapter}/${verse}?lang=${lang}`);
    return response.data;
};

export const getBooks = async () => {
    const response = await axios.get(`${API_BASE_URL}/books`);
    return response.data;
};

export const getChaptersCount = async (book) => {
    const response = await axios.get(`${API_BASE_URL}/chapters/${book}`);
    return response.data;
};

export const getChapter = async (book, chapter, lang = 'en') => {
    const response = await axios.get(`${API_BASE_URL}/chapter/${book}/${chapter}?lang=${lang}`);
    return response.data;
};

export const getVersesListByMood = async (mood, lang = 'en') => {
    const response = await axios.get(`${API_BASE_URL}/mood-filter/${mood}?lang=${lang}`);
    return response.data;
};


export const login = async (identifier, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { identifier, password });
    return response.data;
};

export const register = async (identifier, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, { identifier, password });
    return response.data;
};

// Bookmarks Cache
export const addBookmark = async (payload) => {
    const response = await axios.post(`${API_BASE_URL}/bookmarks`, payload);
    return response.data;
};

export const getBookmarks = async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/bookmarks/${userId}`);
    return response.data;
};

export const removeBookmark = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/bookmarks/${id}`);
    return response.data;
};

// Likes Cache
export const addLike = async (payload) => {
    const response = await axios.post(`${API_BASE_URL}/likes`, payload);
    return response.data;
};

export const getLikes = async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/likes/${userId}`);
    return response.data;
};

export const removeLike = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/likes/${id}`);
    return response.data;
};

// Chat APIs
const getAuthHeaders = () => {
    const token = localStorage.getItem('soulscript_token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const getChatUsers = async () => {
    const response = await axios.get(`${API_BASE_URL}/chat/users`, getAuthHeaders());
    return response.data;
};

export const getChatHistory = async (otherUserId, before = '') => {
    const url = before 
        ? `${API_BASE_URL}/chat/history/${otherUserId}?before=${before}` 
        : `${API_BASE_URL}/chat/history/${otherUserId}`;
    const response = await axios.get(url, getAuthHeaders());
    return response.data;
};

export const sendChatMessage = async (receiverId, message, attachmentUrl = null, attachmentType = null) => {
    const payload = { receiverId, message, attachmentUrl, attachmentType };
    const response = await axios.post(`${API_BASE_URL}/chat/send`, payload, getAuthHeaders());
    return response.data;
};

export const sendHeartbeat = async () => {
    const response = await axios.post(`${API_BASE_URL}/chat/heartbeat`, {}, getAuthHeaders());
    return response.data;
};

export const sendTypingStatus = async (receiverId, isTyping) => {
    const response = await axios.post(`${API_BASE_URL}/chat/typing`, { receiverId, isTyping }, getAuthHeaders());
    return response.data;
};

export const uploadChatFile = async (file) => {
    const formData = new FormData();
    formData.append('attachment', file);
    
    const config = getAuthHeaders();
    config.headers = {
        ...config.headers,
        'Content-Type': 'multipart/form-data'
    };
    
    const response = await axios.post(`${API_BASE_URL}/chat/upload`, formData, config);
    return response.data;
};

export const addChatContact = async (identifier) => {
    const response = await axios.post(`${API_BASE_URL}/chat/contacts`, { identifier }, getAuthHeaders());
    return response.data;
};
