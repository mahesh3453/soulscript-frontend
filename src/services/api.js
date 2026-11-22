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
    if (!token) {
        throw new Error('No authentication token found. Please log in.');
    }
    return { headers: { Authorization: `Bearer ${token}` } };
};

// Axios response interceptor to handle 401 globally
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid — clear stored credentials
            localStorage.removeItem('soulscript_token');
            localStorage.removeItem('soulscript_userId');
            // Don't redirect here; let the component handle navigation
        }
        return Promise.reject(error);
    }
);

export const getChatUsers = async () => {
    const config = getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/chat/users`, config);
    return response.data;
};

export const getChatHistory = async (otherUserId, before = '') => {
    const config = getAuthHeaders();
    const url = before 
        ? `${API_BASE_URL}/chat/history/${otherUserId}?before=${encodeURIComponent(before)}` 
        : `${API_BASE_URL}/chat/history/${otherUserId}`;
    const response = await axios.get(url, config);
    return response.data;
};

export const sendChatMessage = async (receiverId, message, attachmentUrl = null, attachmentType = null) => {
    const config = getAuthHeaders();
    const payload = { receiverId, message: message || '', attachmentUrl, attachmentType };
    const response = await axios.post(`${API_BASE_URL}/chat/send`, payload, config);
    return response.data;
};

export const sendHeartbeat = async () => {
    const config = getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/chat/heartbeat`, {}, config);
    return response.data;
};

export const sendTypingStatus = async (receiverId, isTyping) => {
    const config = getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/chat/typing`, { receiverId, isTyping }, config);
    return response.data;
};

export const uploadChatFile = async (file) => {
    const config = getAuthHeaders();
    const formData = new FormData();
    formData.append('attachment', file);
    config.headers = {
        ...config.headers,
        'Content-Type': 'multipart/form-data'
    };
    const response = await axios.post(`${API_BASE_URL}/chat/upload`, formData, config);
    return response.data;
};

export const addChatContact = async (identifier) => {
    const config = getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/chat/contacts`, { identifier }, config);
    return response.data;
};

// Delete a message: deleteType = 'everyone' | 'me'
export const deleteMessage = async (messageId, deleteType) => {
    const config = getAuthHeaders();
    const response = await axios.delete(`${API_BASE_URL}/chat/message/${messageId}`, {
        ...config,
        data: { deleteType }
    });
    return response.data;
};
