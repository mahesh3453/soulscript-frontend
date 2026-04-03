import { openDB } from 'idb';

const DB_NAME = 'soulscript-db';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store complete chapters
      if (!db.objectStoreNames.contains('chapters')) {
        db.createObjectStore('chapters', { keyPath: 'id' });
      }
      // Store mood-filtered verse lists
      if (!db.objectStoreNames.contains('moods')) {
        db.createObjectStore('moods', { keyPath: 'id' });
      }
      // Store user preferences, bookmarks, and likes for offline
      if (!db.objectStoreNames.contains('userdata')) {
        db.createObjectStore('userdata', { keyPath: 'key' });
      }
    },
  });
};

export const saveChapter = async (book, chapter, lang, data) => {
  const db = await initDB();
  const id = `${lang}-${book}-${chapter}`;
  return db.put('chapters', { id, ...data, timestamp: Date.now() });
};

export const getChapterFromDB = async (book, chapter, lang) => {
  const db = await initDB();
  const id = `${lang}-${book}-${chapter}`;
  return db.get('chapters', id);
};

export const saveMoodVerses = async (mood, lang, data) => {
  const db = await initDB();
  const id = `${lang}-${mood}`;
  return db.put('moods', { id, ...data, timestamp: Date.now() });
};

export const getMoodVersesFromDB = async (mood, lang) => {
  const db = await initDB();
  const id = `${lang}-${mood}`;
  return db.get('moods', id);
};

export const saveUserPreference = async (key, value) => {
  const db = await initDB();
  return db.put('userdata', { key, value, timestamp: Date.now() });
};

export const getUserPreference = async (key) => {
  const db = await initDB();
  const entry = await db.get('userdata', key);
  return entry ? entry.value : null;
};
