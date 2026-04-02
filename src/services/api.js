import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = {
    getRandomVerse: async (lang = 'en') => {
        const response = await axios.get(`${API_BASE_URL}/random?lang=${lang}`);
        return response.data;
    },
    getVerseByMood: async (mood, lang = 'en') => {
        const response = await axios.get(`${API_BASE_URL}/mood/${mood}?lang=${lang}`);
        return response.data;
    },
    getSpecificVerse: async (book, chapter, verse, lang = 'en') => {
        const response = await axios.get(`${API_BASE_URL}/verse/${book}/${chapter}/${verse}?lang=${lang}`);
        return response.data;
    },
    getBooks: async () => {
        const response = await axios.get(`${API_BASE_URL}/books`);
        return response.data;
    },
    getChaptersCount: async (book) => {
        const response = await axios.get(`${API_BASE_URL}/chapters/${book}`);
        return response.data;
    },
    getChapter: async (book, chapter, lang = 'en') => {
        const response = await axios.get(`${API_BASE_URL}/chapter/${book}/${chapter}?lang=${lang}`);
        return response.data;
    },
    // Authentication
    login: async (identifier, password) => {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, { identifier, password });
        return response.data;
    },
    register: async (identifier, password) => {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, { identifier, password });
        return response.data;
    },
    // Bookmarks Cache
    addBookmark: async (payload) => {
        const response = await axios.post(`${API_BASE_URL}/bookmarks`, payload);
        return response.data;
    },
    getBookmarks: async (userId) => {
        const response = await axios.get(`${API_BASE_URL}/bookmarks/${userId}`);
        return response.data;
    },
    removeBookmark: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/bookmarks/${id}`);
        return response.data;
    },
    // Likes Cache
    addLike: async (payload) => {
        const response = await axios.post(`${API_BASE_URL}/likes`, payload);
        return response.data;
    },
    getLikes: async (userId) => {
        const response = await axios.get(`${API_BASE_URL}/likes/${userId}`);
        return response.data;
    },
    removeLike: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/likes/${id}`);
        return response.data;
    }
};

export default api;
